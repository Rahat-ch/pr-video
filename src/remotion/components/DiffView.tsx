import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion'
import { theme } from '../styles/theme'

export interface DiffLine {
  type: 'add' | 'remove' | 'context'
  content: string
  lineNumber?: number
}

export interface DiffViewProps {
  fileName: string
  lines: DiffLine[]
  highlightedTokens?: Array<{ start: number; end: number; color: string }>
}

export const DiffView: React.FC<DiffViewProps> = ({ fileName, lines }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const containerSpring = spring({ frame, fps, config: { damping: 20 } })

  return (
    <AbsoluteFill style={{
      backgroundColor: theme.colors.background,
      padding: theme.spacing.xl,
      fontFamily: theme.fonts.mono,
    }}>
      <div style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        border: `1px solid ${theme.colors.border}`,
        overflow: 'hidden',
        transform: `scale(${interpolate(containerSpring, [0, 1], [0.95, 1])})`,
        opacity: containerSpring,
      }}>
        <div style={{
          padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
          backgroundColor: theme.colors.surfaceLight,
          borderBottom: `1px solid ${theme.colors.border}`,
          fontSize: 14,
          color: theme.colors.textMuted,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
        }}>
          <FileIcon />
          <span>{fileName}</span>
        </div>

        <div style={{ padding: theme.spacing.md }}>
          {lines.map((line, i) => {
            const lineDelay = i * 3
            const lineSpring = spring({
              frame: frame - lineDelay,
              fps,
              config: { damping: 15 }
            })
            const lineOpacity = interpolate(lineSpring, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
            const lineX = interpolate(lineSpring, [0, 1], [-20, 0], { extrapolateRight: 'clamp' })

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  opacity: lineOpacity,
                  transform: `translateX(${lineX}px)`,
                  backgroundColor: getLineBackground(line.type),
                  marginBottom: 2,
                  borderRadius: 4,
                  padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
                }}
              >
                <span style={{
                  width: 30,
                  color: theme.colors.textMuted,
                  fontSize: 12,
                  userSelect: 'none',
                }}>
                  {line.lineNumber || ''}
                </span>
                <span style={{
                  width: 20,
                  color: getLineIndicatorColor(line.type),
                  fontWeight: 600,
                }}>
                  {getLineIndicator(line.type)}
                </span>
                <code style={{
                  color: theme.colors.text,
                  fontSize: 14,
                  whiteSpace: 'pre',
                }}>
                  {line.content}
                </code>
              </div>
            )
          })}
        </div>
      </div>
    </AbsoluteFill>
  )
}

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill={theme.colors.textMuted}>
    <path d="M2 1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0112.25 16h-8.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V4.664a.25.25 0 00-.073-.177l-2.914-2.914a.25.25 0 00-.177-.073H3.75z"/>
  </svg>
)

function getLineBackground(type: DiffLine['type']): string {
  switch (type) {
    case 'add': return 'rgba(63, 185, 80, 0.15)'
    case 'remove': return 'rgba(248, 81, 73, 0.15)'
    default: return 'transparent'
  }
}

function getLineIndicatorColor(type: DiffLine['type']): string {
  switch (type) {
    case 'add': return theme.colors.success
    case 'remove': return theme.colors.danger
    default: return theme.colors.textMuted
  }
}

function getLineIndicator(type: DiffLine['type']): string {
  switch (type) {
    case 'add': return '+'
    case 'remove': return '-'
    default: return ' '
  }
}
