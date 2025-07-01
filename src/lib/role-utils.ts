// Utility functions for role display names

export type DatabaseRole = 'admin' | 'client' | 'tasker' | 'company'
export type DisplayRole = 'Admin' | 'Client' | 'Tasker' | 'Company'

export function getRoleDisplayName(role: DatabaseRole): DisplayRole {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'client':
      return 'Client'
    case 'tasker':
      return 'Tasker'
    case 'company':
      return 'Company'
    default:
      return 'Unknown' as DisplayRole
  }
}

export function getRoleBadgeText(role: DatabaseRole): string {
  return getRoleDisplayName(role)
}

export function formatUserRole(role: DatabaseRole): string {
  return getRoleDisplayName(role)
}
