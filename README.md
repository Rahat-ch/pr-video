# pr-video

Generate demo videos for GitHub Pull Requests. Combines AI-powered PR analysis with screen recordings to create shareable videos showcasing your changes.

## Quick Start

```bash
export ANTHROPIC_API_KEY=sk-ant-...

# Frontend PR with preview
npx pr-video demo https://github.com/org/repo/pull/123 https://preview.vercel.app

# Backend PR (no preview - shows code diff)
npx pr-video demo https://github.com/org/repo/pull/123
```

## Examples

**Single page demo:**
```bash
npx pr-video demo https://github.com/org/repo/pull/123 \
  https://myapp.vercel.app/new-feature \
  -o demo.mp4
```

**Multi-page tour (great for docs PRs):**
```bash
npx pr-video demo https://github.com/org/repo/pull/123 \
  https://docs.site.com/feature/overview \
  https://docs.site.com/feature/page1 \
  https://docs.site.com/feature/page2 \
  --duration 25 \
  -o feature-tour.mp4
```

**Backend-only (shows animated code diff):**
```bash
npx pr-video demo https://github.com/org/repo/pull/123 -o backend.mp4
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output` | Output video path | `./pr-demo.mp4` |
| `--duration` | Recording duration in seconds | `15` |
| `--github-token` | GitHub token (for private repos) | - |
| `--anthropic-key` | Anthropic API key | - |

## Other Commands

```bash
# Analyze PR without generating video
npx pr-video analyze https://github.com/org/repo/pull/123

# Record a URL only (no PR analysis)
npx pr-video record https://mysite.com -o recording.webm --duration 10
```

## Video Structure

1. **Intro** - PR title + repo name
2. **Files** - Animated file tree of changes
3. **Demo/Diff** - Screen recording (frontend) or code diff (backend)
4. **Stats** - Lines added/removed
5. **Outro** - PR number + author

## Setup

**Required:**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

**For private repos:**
```bash
export GITHUB_TOKEN=ghp_...
```

**First run installs Playwright automatically. Or install manually:**
```bash
npx playwright install chromium
```

## Requirements

- Node.js 18+
- Anthropic API key (for PR analysis)
- GitHub token (optional, for private repos)
