'use client'

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
import { LayoutDashboard, User, LogOut, Crown, Building2 } from 'lucide-react'

export function UserMenu() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    return null
  }

  const userInitials = user.name
    ?.split(' ')
    .map((name: string) => name[0])
    .join('')
    .toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Admin
          </span>
        )
      case 'employer':
        return (
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            Employer
          </span>
        )
      case 'company':
        return (
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            Company
          </span>
        )
      case 'employee':
        return (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            Employee
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            User
          </span>
        )
    }
  }

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
            <p className="text-sm font-medium leading-none">
              {user.name || 'User'}
            </p>
            {user.username && (
              <p className="text-xs leading-none text-muted-foreground">
                @{user.username}
              </p>
            )}
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {user.role && (
              <p className="text-xs leading-none text-muted-foreground font-medium">
                {getRoleBadge(user.role)}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
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
