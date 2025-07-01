'use client'

interface ConnectionBalanceProps {
  connections: number
}

export function ConnectionBalance({ connections }: ConnectionBalanceProps) {
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-2">
        <span className="text-3xl font-bold">{connections}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Available connections
      </p>
    </div>
  )
}
