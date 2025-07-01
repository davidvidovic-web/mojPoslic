'use client'

interface LowConnectionsWarningProps {
  connections: number
}

export function LowConnectionsWarning({ connections }: LowConnectionsWarningProps) {
  if (connections >= 3) return null

  return (
    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
      <p className="text-sm text-yellow-700 dark:text-yellow-300">
        <strong>Low connections!</strong> Consider waiting for your monthly refresh or contact support if you need more connections.
      </p>
    </div>
  )
}
