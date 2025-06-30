'use client'

import { useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminTestPage() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('mail@davidvidovic.com')
  const [password, setPassword] = useState('vida97vida!@')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleCreateAdmin = async () => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'mail@davidvidovic.com',
          password: 'vida97vida!@',
          name: 'David Vidovic'
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage(`✅ ${data.message}`)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async () => {
    setLoading(true)
    setMessage('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setMessage(`❌ Sign in failed: ${result.error}`)
      } else {
        setMessage('✅ Sign in successful!')
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    setMessage('Signed out successfully')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Test Page</h1>
      
      {/* Session Status */}
      <Card>
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Status:</strong> {status}</p>
          {session ? (
            <div className="space-y-2">
              <p><strong>User:</strong> {session.user?.name}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>Role:</strong> {session.user?.role}</p>
              <p><strong>ID:</strong> {session.user?.id}</p>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          ) : (
            <p>Not signed in</p>
          )}
        </CardContent>
      </Card>

      {/* Create Admin */}
      <Card>
        <CardHeader>
          <CardTitle>Create Admin User</CardTitle>
          <CardDescription>
            Creates admin user: mail@davidvidovic.com
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleCreateAdmin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Admin User'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Sign In */}
      <Card>
        <CardHeader>
          <CardTitle>Test Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSignIn} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Test Sign In'}
          </Button>
        </CardContent>
      </Card>

      {/* Messages */}
      {message && (
        <Card>
          <CardContent className="pt-6">
            <pre className="text-sm whitespace-pre-wrap">{message}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
