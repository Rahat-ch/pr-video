#!/usr/bin/env node

import { Command } from 'commander'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath } from 'url'
import { analyzePR, parsePRUrl } from './analyzer.js'
import { renderPRVideo } from './render.js'
import { postVideoComment } from './comment.js'
import { recordPreview } from './recorder.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const program = new Command()

program
  .name('pr-video')
  .description('Generate demo videos for GitHub Pull Requests')
  .version('0.1.0')

program
  .command('generate')
  .description('Generate a video for a PR')
  .argument('<pr-url>', 'GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)')
  .option('-o, --output <path>', 'Output path for video', './pr-video.mp4')
  .option('--no-post', 'Skip posting to PR')
  .option('--anthropic-key <key>', 'Anthropic API key')
  .option('--github-token <token>', 'GitHub token')
  .action(async (prUrl: string, opts) => {
    try {
      console.log('🔍 Parsing PR URL...')
      const prInfo = parsePRUrl(prUrl)
      console.log(`   Found: ${prInfo.owner}/${prInfo.repo}#${prInfo.number}`)

      console.log('📊 Analyzing PR...')
      const analysis = await analyzePR(prInfo, {
        anthropicKey: opts.anthropicKey,
        githubToken: opts.githubToken,
      })
      console.log(`   Title: ${analysis.title}`)
      console.log(`   Files: ${analysis.files.length}`)
      console.log(`   Frontend: ${analysis.isFrontend}`)

      const outputPath = path.resolve(opts.output)
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      console.log('🎬 Rendering video...')
      await renderPRVideo({
        analysis,
        outputPath,
      })
      console.log(`   Saved to: ${outputPath}`)

      if (opts.post !== false) {
        console.log('📝 Posting to PR...')
        const commentUrl = await postVideoComment({
          owner: prInfo.owner,
          repo: prInfo.repo,
          prNumber: prInfo.number,
          videoPath: outputPath,
          githubToken: opts.githubToken,
        })
        console.log(`   Comment: ${commentUrl}`)
      }

      console.log('✅ Done!')
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program
  .command('analyze')
  .description('Analyze a PR without generating video')
  .argument('<pr-url>', 'GitHub PR URL')
  .option('--anthropic-key <key>', 'Anthropic API key')
  .option('--github-token <token>', 'GitHub token')
  .action(async (prUrl: string, opts) => {
    try {
      const prInfo = parsePRUrl(prUrl)
      const analysis = await analyzePR(prInfo, {
        anthropicKey: opts.anthropicKey,
        githubToken: opts.githubToken,
      })
      console.log(JSON.stringify(analysis, null, 2))
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program
  .command('demo')
  .description('Generate demo video for a PR')
  .argument('<pr-url>', 'GitHub PR URL')
  .argument('[demo-url]', 'URL to record (optional - skip for backend-only PRs)')
  .argument('[additional-urls...]', 'Additional pages to navigate to')
  .option('-o, --output <path>', 'Output path for video', './pr-demo.mp4')
  .option('--duration <seconds>', 'Recording duration in seconds', '15')
  .option('--anthropic-key <key>', 'Anthropic API key')
  .option('--github-token <token>', 'GitHub token (required for private repos)')
  .action(async (prUrl: string, demoUrl: string | undefined, additionalUrls: string[], opts) => {
    try {
      console.log('🔍 Parsing PR URL...')
      const prInfo = parsePRUrl(prUrl)
      console.log(`   Found: ${prInfo.owner}/${prInfo.repo}#${prInfo.number}`)

      console.log('📊 Analyzing PR...')
      const analysis = await analyzePR(prInfo, {
        anthropicKey: opts.anthropicKey,
        githubToken: opts.githubToken,
      })
      console.log(`   Title: ${analysis.title}`)
      console.log(`   Files: ${analysis.files.length}`)

      const outputPath = path.resolve(opts.output)
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      let recordingPath: string | undefined
      if (demoUrl) {
        console.log(`   Demo URL: ${demoUrl}`)
        if (additionalUrls.length > 0) {
          console.log(`   Additional pages: ${additionalUrls.length}`)
          additionalUrls.forEach(u => console.log(`     - ${u}`))
        }

        recordingPath = path.join(outputDir, 'recording.webm')
        console.log('📹 Recording screen...')
        await recordPreview({
          url: demoUrl,
          outputPath: recordingPath,
          duration: parseInt(opts.duration) * 1000,
          pages: additionalUrls,
        })
        console.log(`   Recording saved`)
      } else {
        console.log('   No demo URL - generating code-only video')
      }

      console.log('🎬 Rendering video...')
      await renderPRVideo({
        analysis,
        outputPath,
        screenRecordingSrc: recordingPath,
      })
      console.log(`   Saved to: ${outputPath}`)

      console.log('✅ Done!')
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program
  .command('record')
  .description('Record a screen capture only')
  .argument('<url>', 'URL to record')
  .option('-o, --output <path>', 'Output path', './recording.webm')
  .option('--duration <seconds>', 'Recording duration in seconds', '10')
  .action(async (url: string, opts) => {
    try {
      console.log(`📹 Recording ${url}...`)
      await recordPreview({
        url,
        outputPath: path.resolve(opts.output),
        duration: parseInt(opts.duration) * 1000,
      })
      console.log(`✅ Saved to: ${opts.output}`)
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program
  .command('preview')
  .description('Open Remotion preview with sample data')
  .action(async () => {
    const { execSync } = await import('child_process')
    execSync('npx remotion preview src/remotion/index.ts', {
      stdio: 'inherit',
      cwd: __dirname.replace('/dist', ''),
    })
  })

program.parse()
