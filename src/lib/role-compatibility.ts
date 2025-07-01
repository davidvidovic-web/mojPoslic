// This is a temporary compatibility layer to handle both old and new role names
// Remove this file once the database migration is complete

type OldUserRole = 'admin' | 'employer' | 'employee' | 'company';
type NewUserRole = 'admin' | 'client' | 'tasker' | 'company';

export function mapOldRoleToNew(oldRole: OldUserRole): NewUserRole {
  switch (oldRole) {
    case 'admin': return 'admin';
    case 'employer': return 'client';
    case 'employee': return 'tasker';
    case 'company': return 'company';
    default: return 'tasker'; // Default fallback
  }
}

export function mapNewRoleToOld(newRole: NewUserRole): OldUserRole {
  switch (newRole) {
    case 'admin': return 'admin';
    case 'client': return 'employer';
    case 'tasker': return 'employee';
    case 'company': return 'company';
    default: return 'employee'; // Default fallback
  }
}

// Use this for conditional logic that depends on user roles
export function isClient(role: string): boolean {
  return role === 'client' || role === 'employer';
}

export function isTasker(role: string): boolean {
  return role === 'tasker' || role === 'employee';
}

export function isAdmin(role: string): boolean {
  return role === 'admin';
}

export function isCompany(role: string): boolean {
  return role === 'company';
}
