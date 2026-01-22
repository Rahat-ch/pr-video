import { bundle } from '@remotion/bundler'
import { renderMedia, selectComposition } from '@remotion/renderer'
import * as path from 'path'
import * as fs from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import type { PRAnalysis } from './remotion/PRVideo.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface RenderOptions {
  analysis: PRAnalysis
  outputPath: string
  screenRecordingSrc?: string
}

export async function renderPRVideo(options: RenderOptions): Promise<string> {
  const publicDir = path.resolve(__dirname, '../public')
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  let screenRecordingUrl: string | undefined
  if (options.screenRecordingSrc && fs.existsSync(options.screenRecordingSrc)) {
    const recordingDest = path.join(publicDir, 'recording.webm')
    fs.copyFileSync(options.screenRecordingSrc, recordingDest)
    screenRecordingUrl = 'recording.webm'
  }

  const bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, './remotion/index.ts'),
    webpackOverride: (config) => config,
    publicDir,
  })

  const inputProps = {
    analysis: options.analysis,
    screenRecordingSrc: screenRecordingUrl,
  }

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'PRVideo',
    inputProps,
  })

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: options.outputPath,
    inputProps,
  })

  return options.outputPath
}
