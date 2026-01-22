import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { theme } from '../styles/theme'

export interface CaptionProps {
  text: string
  startFrame?: number
}

export const Caption: React.FC<CaptionProps> = ({ text, startFrame = 0 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const relativeFrame = frame - startFrame

  const fadeIn = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 15 }
  })

  const opacity = interpolate(fadeIn, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
  const y = interpolate(fadeIn, [0, 1], [10, 0], { extrapolateRight: 'clamp' })

  if (relativeFrame < 0) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: 60,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      padding: `0 ${theme.spacing.xl}px`,
    }}>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        borderRadius: 8,
        padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
        maxWidth: '80%',
        opacity,
        transform: `translateY(${y}px)`,
      }}>
        <p style={{
          color: '#fff',
          fontSize: 20,
          fontFamily: theme.fonts.sans,
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {text}
        </p>
      </div>
    </div>
  )
}
