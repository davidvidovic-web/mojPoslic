'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/prisma-auth-context'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboard, User, LogOut, Zap } from 'lucide-react'

export function UserMenu() {
  const { user } = useAuth()
  const router = useRouter()
  const [connections, setConnections] = useState<number>(0)

  // Fetch user connections
  useEffect(() => {
    const fetchConnections = async () => {
      if (user) {
        try {
          const response = await fetch('/api/user/connections')
          if (response.ok) {
            const data = await response.json()
            setConnections(data.connections || 0)
          }
        } catch (error) {
          console.error('Error fetching connections:', error)
        }
      }
    }
    fetchConnections()
  }, [user])

  if (!user) {
    return null
  }

  const userInitials = user.name
    ?.split(' ')
    .map((name: string) => name[0])
    .join('')
    .toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-1 rounded-full min-w-0 w-auto h-auto">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            {user.username && (
              <p className="text-xs leading-none text-muted-foreground">
                @{user.username}
              </p>
            )}
            <p className="text-base font-semibold leading-none">
              {(user.name || 'User').toUpperCase()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard#connections')}>
          <Zap className="mr-2 h-4 w-4" />
          <span className="flex items-center justify-between w-full">
            Connections
            <Badge variant="secondary" className="ml-2">
              {connections}
            </Badge>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <User className="mr-2 h-4 w-4" />
          Profile & Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
