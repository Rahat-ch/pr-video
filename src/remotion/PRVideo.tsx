import { AbsoluteFill, Sequence, OffthreadVideo, staticFile, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { DiffView, FileTree, Stats, Caption } from './components'
import type { DiffLine, FileChange } from './components'
import { theme } from './styles/theme'

export interface PRAnalysis {
  title: string
  number: number
  repo: string
  author: string
  isFrontend: boolean
  narration: string
  keyFiles: string[]
  additions: number
  deletions: number
  files: FileChange[]
  diffSample: {
    fileName: string
    lines: DiffLine[]
  }
}

export interface PRVideoProps {
  analysis: PRAnalysis
  screenRecordingSrc?: string
}

export const PRVideo: React.FC<PRVideoProps> = ({ analysis, screenRecordingSrc }) => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const INTRO_DURATION = fps * 2
  const FILES_DURATION = fps * 3
  const DIFF_DURATION = screenRecordingSrc ? 0 : fps * 5
  const DEMO_DURATION = screenRecordingSrc ? fps * 10 : 0
  const STATS_DURATION = fps * 3
  const OUTRO_DURATION = fps * 2

  let currentFrame = 0

  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
      <Sequence from={currentFrame} durationInFrames={INTRO_DURATION}>
        <Intro
          title={analysis.title}
          repo={analysis.repo}
          prNumber={analysis.number}
        />
      </Sequence>

      {(() => { currentFrame += INTRO_DURATION; return null })()}

      <Sequence from={currentFrame} durationInFrames={FILES_DURATION}>
        <FilesSection files={analysis.files} />
      </Sequence>

      {(() => { currentFrame += FILES_DURATION; return null })()}

      {!screenRecordingSrc && (
        <Sequence from={currentFrame} durationInFrames={DIFF_DURATION}>
          <DiffSection
            fileName={analysis.diffSample.fileName}
            lines={analysis.diffSample.lines}
          />
        </Sequence>
      )}

      {(() => { if (!screenRecordingSrc) currentFrame += DIFF_DURATION; return null })()}

      {screenRecordingSrc && (
        <Sequence from={currentFrame} durationInFrames={DEMO_DURATION}>
          <DemoSection src={screenRecordingSrc} durationInFrames={DEMO_DURATION} />
        </Sequence>
      )}

      {(() => { if (screenRecordingSrc) currentFrame += DEMO_DURATION; return null })()}

      <Sequence from={currentFrame} durationInFrames={STATS_DURATION}>
        <StatsSection
          additions={analysis.additions}
          deletions={analysis.deletions}
          filesChanged={analysis.files.length}
        />
      </Sequence>

      <Sequence from={durationInFrames - OUTRO_DURATION} durationInFrames={OUTRO_DURATION}>
        <Outro
          prNumber={analysis.number}
          author={analysis.author}
        />
      </Sequence>

      <Sequence from={INTRO_DURATION} durationInFrames={durationInFrames - INTRO_DURATION - OUTRO_DURATION}>
        <Caption text={analysis.narration} startFrame={0} />
      </Sequence>
    </AbsoluteFill>
  )
}

const Intro: React.FC<{ title: string; repo: string; prNumber: number }> = ({ title, repo, prNumber }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleSpring = spring({ frame, fps, config: { damping: 15 } })
  const repoSpring = spring({ frame: frame - 10, fps, config: { damping: 15 } })

  return (
    <AbsoluteFill style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.md,
        opacity: interpolate(repoSpring, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(repoSpring, [0, 1], [-20, 0])}px)`,
        marginBottom: theme.spacing.lg,
      }}>
        <GitHubIcon />
        <span style={{
          color: theme.colors.textMuted,
          fontFamily: theme.fonts.mono,
          fontSize: 18,
        }}>
          {repo}
        </span>
      </div>

      <h1 style={{
        color: theme.colors.text,
        fontFamily: theme.fonts.sans,
        fontSize: 48,
        fontWeight: 700,
        textAlign: 'center',
        margin: 0,
        opacity: interpolate(titleSpring, [0, 1], [0, 1]),
        transform: `scale(${interpolate(titleSpring, [0, 1], [0.9, 1])})`,
        maxWidth: '80%',
        lineHeight: 1.3,
      }}>
        {title}
      </h1>

      <div style={{
        marginTop: theme.spacing.lg,
        padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
        backgroundColor: theme.colors.accent,
        borderRadius: 20,
        opacity: interpolate(repoSpring, [0, 1], [0, 1]),
      }}>
        <span style={{
          color: '#fff',
          fontFamily: theme.fonts.mono,
          fontSize: 16,
          fontWeight: 600,
        }}>
          #{prNumber}
        </span>
      </div>
    </AbsoluteFill>
  )
}

const FilesSection: React.FC<{ files: FileChange[] }> = ({ files }) => {
  return (
    <AbsoluteFill style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    }}>
      <FileTree files={files.slice(0, 8)} />
    </AbsoluteFill>
  )
}

const DiffSection: React.FC<{ fileName: string; lines: DiffLine[] }> = ({ fileName, lines }) => {
  return <DiffView fileName={fileName} lines={lines.slice(0, 15)} />
}

const StatsSection: React.FC<{ additions: number; deletions: number; filesChanged: number }> = (props) => {
  return (
    <AbsoluteFill style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Stats {...props} />
    </AbsoluteFill>
  )
}

const DemoSection: React.FC<{ src: string; durationInFrames: number }> = ({ src, durationInFrames }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const fadeIn = spring({ frame, fps, config: { damping: 20 } })
  const fadeOutStart = durationInFrames - fps * 1.5
  const fadeOut = interpolate(frame, [fadeOutStart, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const opacity = Math.min(interpolate(fadeIn, [0, 1], [0, 1]), fadeOut)

  const videoSrc = src.startsWith('http') ? src : staticFile(src)

  return (
    <AbsoluteFill style={{
      backgroundColor: theme.colors.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    }}>
      <div style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: `2px solid ${theme.colors.border}`,
        opacity,
        transform: `scale(${interpolate(fadeIn, [0, 1], [0.95, 1])})`,
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 36,
          backgroundColor: theme.colors.surfaceLight,
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${theme.spacing.md}px`,
          gap: theme.spacing.sm,
          zIndex: 10,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840' }} />
          <span style={{
            marginLeft: theme.spacing.md,
            color: theme.colors.textMuted,
            fontSize: 13,
            fontFamily: theme.fonts.mono,
          }}>
            Live Demo
          </span>
        </div>
        <div style={{ paddingTop: 36 }}>
          <OffthreadVideo
            src={videoSrc}
            style={{
              width: 1600,
              height: 900,
              display: 'block',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  )
}

const Outro: React.FC<{ prNumber: number; author: string }> = ({ prNumber, author }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const spring1 = spring({ frame, fps, config: { damping: 15 } })

  return (
    <AbsoluteFill style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: interpolate(spring1, [0, 1], [0, 1]),
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.md,
      }}>
        <PRIcon />
        <span style={{
          color: theme.colors.success,
          fontFamily: theme.fonts.mono,
          fontSize: 32,
          fontWeight: 700,
        }}>
          PR #{prNumber}
        </span>
      </div>
      <span style={{
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.sans,
        fontSize: 18,
      }}>
        by {author}
      </span>
    </AbsoluteFill>
  )
}

const GitHubIcon = () => (
  <svg width="32" height="32" viewBox="0 0 16 16" fill={theme.colors.text}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
  </svg>
)

const PRIcon = () => (
  <svg width="32" height="32" viewBox="0 0 16 16" fill={theme.colors.success}>
    <path d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
  </svg>
)
