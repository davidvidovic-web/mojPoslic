import { useCitiesQuery } from '@/hooks/queries/useStaticData'

export function SupabaseConnectionTest() {
  const { data: cities, isLoading, error } = useCitiesQuery()

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        {/* Hardcoded in Bosnian - debug component */}
        <h3 className="font-semibold mb-2">🔄 Testiranje Supabase konekcije...</h3>
        <p className="text-sm text-muted-foreground">Učitavanje gradova iz Supabase...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="font-semibold mb-2 text-red-700">❌ Supabase Connection Failed</h3>
        <p className="text-sm text-red-600">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
      <h3 className="font-semibold mb-2 text-green-700">✅ Supabase Connection Successful!</h3>
      <p className="text-sm text-green-600 mb-2">
        Successfully loaded {cities?.length || 0} cities from Supabase database.
      </p>
      {cities && cities.length > 0 && (
        <details className="mt-2">
          <summary className="text-sm cursor-pointer">View sample cities</summary>
          <ul className="mt-2 text-xs space-y-1">
            {cities.slice(0, 5).map((city) => (
              <li key={city.id} className="flex justify-between">
                <span>{city.name}</span>
                <span className="text-muted-foreground">{city.id}</span>
              </li>
            ))}
            {cities.length > 5 && (
              <li className="text-muted-foreground italic">
                ...and {cities.length - 5} more cities
              </li>
            )}
          </ul>
        </details>
      )}
    </div>
  )
}
