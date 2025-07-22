import { ActiveJobsList } from '@/components/jobs/active-jobs-list'
import { RoleGuard } from '@/components/auth/role-guard'

export default function ActiveJobsPage() {
  return (
    <RoleGuard requireRole={true} requireProfileSetup={true}>
      <div className="container mx-auto px-4 py-8">
        <ActiveJobsList />
      </div>
    </RoleGuard>
  )
}
