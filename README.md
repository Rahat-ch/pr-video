# pr-video

Generate demo videos for GitHub Pull Requests. Combines AI-powered PR analysis with screen recordings to create shareable videos showcasing your changes.

## Install

```bash
npm install -g pr-video

# Install Playwright browser (required for screen recording)
npx playwright install chromium
```

## Setup

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

For private repos, also set:

```bash
export GITHUB_TOKEN=ghp_...
```

## Usage

### Generate a demo video

```bash
pr-video demo <pr-url> <demo-url> [additional-urls...] -o output.mp4
```

**Example - Single page:**
```bash
pr-video demo https://github.com/org/repo/pull/123 https://mysite.com/new-feature -o demo.mp4
```

**Example - Multi-page tour:**
```bash
pr-video demo https://github.com/org/repo/pull/123 \
  https://docs.site.com/feature/overview \
  https://docs.site.com/feature/page1 \
  https://docs.site.com/feature/page2 \
  -o feature-tour.mp4 --duration 20000
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `-o, --output` | Output video path | `./pr-demo.mp4` |
| `--duration` | Recording duration (ms) | `15000` |

### Other commands

```bash
# Analyze PR without generating video
pr-video analyze <pr-url>

# Record a URL only (no PR analysis)
pr-video record <url> -o recording.webm
```

## Video Structure

1. **Intro** - PR title + repo name
2. **Files** - Animated file tree of changes
3. **Demo** - Screen recording of your feature (with fade out)
4. **Stats** - Lines added/removed
5. **Outro** - PR number + author

## Requirements

- Node.js 18+
- Anthropic API key (for PR analysis)
- GitHub token (optional, required for private repos)
