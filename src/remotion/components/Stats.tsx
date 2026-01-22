import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { theme } from '../styles/theme'

export interface StatsProps {
  additions: number
  deletions: number
  filesChanged: number
  commits?: number
}

export const Stats: React.FC<StatsProps> = ({ additions, deletions, filesChanged, commits }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const stats = [
    { label: 'Files Changed', value: filesChanged, color: theme.colors.accent, icon: FilesIcon },
    { label: 'Additions', value: additions, color: theme.colors.success, icon: PlusIcon },
    { label: 'Deletions', value: deletions, color: theme.colors.danger, icon: MinusIcon },
    ...(commits ? [{ label: 'Commits', value: commits, color: theme.colors.warning, icon: CommitIcon }] : []),
  ]

  return (
    <div style={{
      display: 'flex',
      gap: theme.spacing.lg,
      justifyContent: 'center',
      flexWrap: 'wrap',
    }}>
      {stats.map((stat, i) => {
        const delay = i * 8
        const statSpring = spring({
          frame: frame - delay,
          fps,
          config: { damping: 12 }
        })
        const opacity = interpolate(statSpring, [0, 1], [0, 1], { extrapolateRight: 'clamp' })
        const scale = interpolate(statSpring, [0, 1], [0.5, 1], { extrapolateRight: 'clamp' })
        const y = interpolate(statSpring, [0, 1], [20, 0], { extrapolateRight: 'clamp' })

        const countProgress = interpolate(
          frame - delay,
          [0, 30],
          [0, 1],
          { extrapolateRight: 'clamp' }
        )
        const displayValue = Math.round(stat.value * countProgress)

        return (
          <div
            key={stat.label}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              border: `1px solid ${theme.colors.border}`,
              padding: theme.spacing.lg,
              minWidth: 140,
              textAlign: 'center',
              opacity,
              transform: `scale(${scale}) translateY(${y}px)`,
              fontFamily: theme.fonts.sans,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: theme.spacing.sm,
            }}>
              <stat.icon color={stat.color} />
            </div>
            <div style={{
              fontSize: 36,
              fontWeight: 700,
              color: stat.color,
              fontFamily: theme.fonts.mono,
            }}>
              {stat.label.includes('Additions') ? '+' : stat.label.includes('Deletions') ? '-' : ''}
              {displayValue}
            </div>
            <div style={{
              fontSize: 13,
              color: theme.colors.textMuted,
              marginTop: theme.spacing.xs,
            }}>
              {stat.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const FilesIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 16 16" fill={color}>
    <path d="M1.75 1A1.75 1.75 0 000 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0016 13.25v-8.5A1.75 1.75 0 0014.25 3H7.5a.25.25 0 01-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75z"/>
  </svg>
)

const PlusIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 16 16" fill={color}>
    <path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"/>
  </svg>
)

const MinusIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 16 16" fill={color}>
    <path d="M2 7.75A.75.75 0 012.75 7h10a.75.75 0 010 1.5h-10A.75.75 0 012 7.75z"/>
  </svg>
)

const CommitIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 16 16" fill={color}>
    <path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5h3.32a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zm-1.43-.75a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0z"/>
  </svg>
)
