import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion'
import { theme } from '../styles/theme'

export interface ScreenRecordingProps {
  src: string
  startFrom?: number
}

export const ScreenRecording: React.FC<ScreenRecordingProps> = ({ src, startFrom = 0 }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.colors.background }}>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
      }}>
        <div style={{
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: `1px solid ${theme.colors.border}`,
        }}>
          <OffthreadVideo
            src={src}
            startFrom={startFrom}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  )
}
