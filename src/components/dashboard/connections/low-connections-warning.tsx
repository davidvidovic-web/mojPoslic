'use client'

interface LowConnectionsWarningProps {
  connections: number
  userRole?: string
}

export function LowConnectionsWarning({ connections, userRole = 'tasker' }: LowConnectionsWarningProps) {
  if (connections >= 3) return null

  const getWarningMessage = () => {
    switch (userRole) {
      case 'client':
        return 'Low connections! You need connections to post multiple jobs daily. Quick jobs require 3 connections each.'
      case 'company':
        return 'Low connections! You need connections to post jobs on the platform.'
      case 'tasker':
      default:
        return 'Low connections! You need connections to apply for professional jobs.'
    }
  }

  return (
    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
      <p className="text-sm text-yellow-700 dark:text-yellow-300">
        <strong>{getWarningMessage()}</strong> We can always give you connects for sharing our website, send customer support proof of sharing and we will grant you connects.
      </p>
    </div>
  )
}
