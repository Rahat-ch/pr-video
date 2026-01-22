import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { theme } from '../styles/theme'

export interface FileChange {
  path: string
  additions: number
  deletions: number
  status: 'added' | 'modified' | 'deleted' | 'renamed'
}

export interface FileTreeProps {
  files: FileChange[]
  title?: string
}

export const FileTree: React.FC<FileTreeProps> = ({ files, title = 'Files Changed' }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const headerSpring = spring({ frame, fps, config: { damping: 20 } })

  return (
    <div style={{
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      border: `1px solid ${theme.colors.border}`,
      overflow: 'hidden',
      fontFamily: theme.fonts.sans,
      width: '100%',
      maxWidth: 600,
    }}>
      <div style={{
        padding: `${theme.spacing.md}px`,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.sm,
        opacity: headerSpring,
      }}>
        <FolderIcon />
        <span style={{ color: theme.colors.text, fontWeight: 600 }}>{title}</span>
        <span style={{
          marginLeft: 'auto',
          color: theme.colors.textMuted,
          fontSize: 14,
        }}>
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ padding: theme.spacing.sm }}>
        {files.map((file, i) => {
          const delay = 10 + i * 5
          const itemSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15 }
          })
          const opacity = interpolate(itemSpring, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
          const x = interpolate(itemSpring, [0, 1], [-30, 0], { extrapolateRight: 'clamp' })

          return (
            <div
              key={file.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
                borderRadius: 8,
                opacity,
                transform: `translateX(${x}px)`,
                backgroundColor: i % 2 === 0 ? 'transparent' : theme.colors.surfaceLight,
              }}
            >
              <StatusIcon status={file.status} />
              <span style={{
                flex: 1,
                color: theme.colors.text,
                fontSize: 14,
                fontFamily: theme.fonts.mono,
                marginLeft: theme.spacing.sm,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {file.path}
              </span>
              <div style={{ display: 'flex', gap: theme.spacing.sm, marginLeft: theme.spacing.md }}>
                {file.additions > 0 && (
                  <span style={{ color: theme.colors.success, fontSize: 13, fontWeight: 600 }}>
                    +{file.additions}
                  </span>
                )}
                {file.deletions > 0 && (
                  <span style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 600 }}>
                    -{file.deletions}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const FolderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 16 16" fill={theme.colors.accent}>
    <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"/>
  </svg>
)

const StatusIcon: React.FC<{ status: FileChange['status'] }> = ({ status }) => {
  const colors: Record<FileChange['status'], string> = {
    added: theme.colors.success,
    modified: theme.colors.warning,
    deleted: theme.colors.danger,
    renamed: theme.colors.accent,
  }

  const labels: Record<FileChange['status'], string> = {
    added: 'A',
    modified: 'M',
    deleted: 'D',
    renamed: 'R',
  }

  return (
    <div style={{
      width: 20,
      height: 20,
      borderRadius: 4,
      backgroundColor: colors[status],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
      color: theme.colors.background,
    }}>
      {labels[status]}
    </div>
  )
}
