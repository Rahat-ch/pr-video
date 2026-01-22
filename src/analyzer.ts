import Anthropic from '@anthropic-ai/sdk'
import { Octokit } from '@octokit/rest'
import parseDiff from 'parse-diff'
import type { PRAnalysis } from './remotion/PRVideo.js'
import type { DiffLine, FileChange } from './remotion/components/index.js'

export interface PRInfo {
  owner: string
  repo: string
  number: number
}

export async function analyzePR(prInfo: PRInfo, options?: {
  anthropicKey?: string
  githubToken?: string
}): Promise<PRAnalysis> {
  const anthropic = new Anthropic({
    apiKey: options?.anthropicKey || process.env.ANTHROPIC_API_KEY,
  })

  const token = options?.githubToken || process.env.GITHUB_TOKEN
  const octokit = new Octokit(token ? { auth: token } : {})

  const [prData, diffData] = await Promise.all([
    octokit.pulls.get({
      owner: prInfo.owner,
      repo: prInfo.repo,
      pull_number: prInfo.number,
    }),
    octokit.pulls.get({
      owner: prInfo.owner,
      repo: prInfo.repo,
      pull_number: prInfo.number,
      mediaType: { format: 'diff' },
    }),
  ])

  const pr = prData.data
  const diffText = diffData.data as unknown as string
  const parsedDiff = parseDiff(diffText)

  const files: FileChange[] = parsedDiff.map((file) => ({
    path: file.to || file.from || 'unknown',
    additions: file.additions,
    deletions: file.deletions,
    status: getFileStatus(file),
  }))

  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0)
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0)

  const keyFile = findKeyFile(parsedDiff)
  const diffSample = extractDiffSample(keyFile)

  const aiAnalysis = await analyzeWithClaude(anthropic, {
    title: pr.title,
    body: pr.body || '',
    files,
    diffSample: diffText.slice(0, 4000),
  })

  return {
    title: pr.title,
    number: pr.number,
    repo: `${prInfo.owner}/${prInfo.repo}`,
    author: pr.user?.login || 'unknown',
    isFrontend: aiAnalysis.isFrontend,
    narration: aiAnalysis.narration,
    keyFiles: aiAnalysis.keyFiles,
    additions: totalAdditions,
    deletions: totalDeletions,
    files,
    diffSample,
  }
}

function getFileStatus(file: parseDiff.File): FileChange['status'] {
  if (file.new) return 'added'
  if (file.deleted) return 'deleted'
  if (file.from !== file.to) return 'renamed'
  return 'modified'
}

function findKeyFile(parsedDiff: parseDiff.File[]): parseDiff.File | undefined {
  const frontendExtensions = ['.tsx', '.jsx', '.vue', '.svelte']
  const backendExtensions = ['.ts', '.js', '.py', '.go', '.rs']

  const sorted = [...parsedDiff].sort((a, b) => {
    const aChanges = a.additions + a.deletions
    const bChanges = b.additions + b.deletions
    return bChanges - aChanges
  })

  const frontend = sorted.find((f) =>
    frontendExtensions.some((ext) => (f.to || f.from)?.endsWith(ext))
  )
  if (frontend) return frontend

  const backend = sorted.find((f) =>
    backendExtensions.some((ext) => (f.to || f.from)?.endsWith(ext))
  )
  if (backend) return backend

  return sorted[0]
}

function extractDiffSample(file?: parseDiff.File): { fileName: string; lines: DiffLine[] } {
  if (!file || !file.chunks.length) {
    return { fileName: 'unknown', lines: [] }
  }

  const lines: DiffLine[] = []
  const chunk = file.chunks[0]

  for (const change of chunk.changes.slice(0, 20)) {
    lines.push({
      type: change.type === 'add' ? 'add' : change.type === 'del' ? 'remove' : 'context',
      content: change.content.slice(1),
      lineNumber: 'ln' in change ? change.ln : ('ln2' in change ? change.ln2 : undefined),
    })
  }

  return {
    fileName: file.to || file.from || 'unknown',
    lines,
  }
}

interface AIAnalysis {
  isFrontend: boolean
  narration: string
  keyFiles: string[]
}

async function analyzeWithClaude(
  anthropic: Anthropic,
  context: {
    title: string
    body: string
    files: FileChange[]
    diffSample: string
  }
): Promise<AIAnalysis> {
  const prompt = `Analyze this pull request and provide:
1. Is this primarily a frontend change? (true/false)
2. A 2-3 sentence narration explaining what this PR does (for a video caption)
3. The 2-3 most important files changed

PR Title: ${context.title}
PR Description: ${context.body || 'No description'}

Files changed:
${context.files.map((f) => `- ${f.path} (+${f.additions}/-${f.deletions})`).join('\n')}

Diff sample:
\`\`\`
${context.diffSample}
\`\`\`

Respond in JSON format:
{
  "isFrontend": boolean,
  "narration": "string",
  "keyFiles": ["file1", "file2"]
}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // fallback
  }

  return {
    isFrontend: context.files.some((f) =>
      ['.tsx', '.jsx', '.vue', '.svelte', '.css', '.scss'].some((ext) => f.path.endsWith(ext))
    ),
    narration: `This PR "${context.title}" modifies ${context.files.length} files with ${context.files.reduce((s, f) => s + f.additions, 0)} additions.`,
    keyFiles: context.files.slice(0, 3).map((f) => f.path),
  }
}

export function parsePRUrl(url: string): PRInfo {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/)
  if (!match) {
    throw new Error(`Invalid PR URL: ${url}`)
  }
  return {
    owner: match[1],
    repo: match[2],
    number: parseInt(match[3], 10),
  }
}
