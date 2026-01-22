import { chromium, Browser, Page } from 'playwright'
import * as path from 'path'
import * as fs from 'fs'

export interface RecordingOptions {
  url: string
  outputPath: string
  duration?: number
  width?: number
  height?: number
  pages?: string[]
}

export async function recordPreview(options: RecordingOptions): Promise<string> {
  const {
    url,
    outputPath,
    duration = 10000,
    width = 1920,
    height = 1080,
    pages = []
  } = options

  const browser = await chromium.launch({
    headless: true,
  })

  const context = await browser.newContext({
    viewport: { width, height },
    recordVideo: {
      dir: path.dirname(outputPath),
      size: { width, height },
    },
  })

  const page = await context.newPage()

  try {
    console.log(`   Loading ${url}...`)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500)

    if (pages.length > 0) {
      // Multi-page tour
      const timePerPage = Math.floor(duration / (pages.length + 1))

      // Scroll current page first
      await smoothScroll(page, 400)
      await page.waitForTimeout(1000)
      await smoothScroll(page, -200)
      await page.waitForTimeout(500)

      for (const pageUrl of pages) {
        console.log(`   Navigating to ${pageUrl}...`)
        await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(1000)
        await smoothScroll(page, 400)
        await page.waitForTimeout(timePerPage - 1500)
      }
    } else {
      // Single page - just scroll
      await autoScroll(page, duration)
    }

    await page.waitForTimeout(1000)
  } finally {
    await page.close()
    await context.close()
    await browser.close()
  }

  const videos = fs.readdirSync(path.dirname(outputPath))
    .filter(f => f.endsWith('.webm'))
    .map(f => path.join(path.dirname(outputPath), f))
    .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime())

  if (videos.length > 0) {
    const latestVideo = videos[0]
    if (latestVideo !== outputPath) {
      fs.renameSync(latestVideo, outputPath)
    }
    return outputPath
  }

  throw new Error('No video file generated')
}

async function smoothScroll(page: Page, amount: number) {
  await page.evaluate((y) => window.scrollBy({ top: y, behavior: 'smooth' }), amount)
}

async function autoScroll(page: Page, duration: number) {
  const scrollSteps = Math.floor(duration / 1500)
  const scrollAmount = 300

  for (let i = 0; i < scrollSteps; i++) {
    await page.evaluate((y) => window.scrollBy({ top: y, behavior: 'smooth' }), scrollAmount)
    await page.waitForTimeout(1500)
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  await page.waitForTimeout(1000)
}

export function extractNewRoutes(files: Array<{ path: string; status: string }>): string[] {
  const routes: string[] = []

  for (const file of files) {
    if (file.status !== 'added') continue

    if (file.path.includes('/docs/') && file.path.endsWith('.mdx')) {
      let route = file.path
        .replace(/^content/, '')
        .replace(/\.mdx$/, '')
        .replace(/\/index$/, '')

      if (route.includes('/meta.json')) continue

      routes.push(route)
    }
    else if (file.path.match(/\/(pages|app)\//) && file.path.match(/\.(tsx?|jsx?)$/)) {
      let route = file.path
        .replace(/^src\//, '')
        .replace(/^(pages|app)/, '')
        .replace(/\.(tsx?|jsx?)$/, '')
        .replace(/\/index$/, '')
        .replace(/\/page$/, '')

      if (!route.startsWith('/_') && !route.includes('/api/')) {
        routes.push(route)
      }
    }
  }

  return routes
}

export function buildDemoUrl(baseUrl: string, routes: string[]): string {
  if (routes.length === 0) return baseUrl

  const primaryRoute = routes.find(r => r.includes('overview'))
    || routes.find(r => !r.includes('meta'))
    || routes[0]

  return `${baseUrl.replace(/\/$/, '')}${primaryRoute}`
}
