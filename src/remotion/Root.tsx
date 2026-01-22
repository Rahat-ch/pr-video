import React from 'react'
import { Composition } from 'remotion'
import { PRVideo } from './PRVideo'
import type { PRAnalysis } from './PRVideo'

const defaultAnalysis: PRAnalysis = {
  title: 'Add user authentication flow',
  number: 42,
  repo: 'acme/web-app',
  author: 'johndoe',
  isFrontend: true,
  narration: 'This PR adds a complete user authentication flow with login, signup, and password reset functionality.',
  keyFiles: ['src/auth/login.tsx', 'src/auth/signup.tsx'],
  additions: 247,
  deletions: 23,
  files: [
    { path: 'src/auth/login.tsx', additions: 85, deletions: 0, status: 'added' },
    { path: 'src/auth/signup.tsx', additions: 92, deletions: 0, status: 'added' },
    { path: 'src/auth/reset.tsx', additions: 45, deletions: 0, status: 'added' },
    { path: 'src/api/auth.ts', additions: 25, deletions: 8, status: 'modified' },
    { path: 'package.json', additions: 0, deletions: 15, status: 'modified' },
  ],
  diffSample: {
    fileName: 'src/auth/login.tsx',
    lines: [
      { type: 'context', content: "import { useState } from 'react'", lineNumber: 1 },
      { type: 'add', content: "import { useAuth } from '../hooks/useAuth'", lineNumber: 2 },
      { type: 'context', content: '', lineNumber: 3 },
      { type: 'add', content: 'export function LoginForm() {', lineNumber: 4 },
      { type: 'add', content: '  const [email, setEmail] = useState("")', lineNumber: 5 },
      { type: 'add', content: '  const [password, setPassword] = useState("")', lineNumber: 6 },
      { type: 'add', content: '  const { login } = useAuth()', lineNumber: 7 },
      { type: 'context', content: '', lineNumber: 8 },
      { type: 'add', content: '  const handleSubmit = async (e) => {', lineNumber: 9 },
      { type: 'add', content: '    e.preventDefault()', lineNumber: 10 },
      { type: 'add', content: '    await login(email, password)', lineNumber: 11 },
      { type: 'add', content: '  }', lineNumber: 12 },
    ],
  },
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PRVideo"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={PRVideo as any}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          analysis: defaultAnalysis,
        }}
      />
    </>
  )
}
