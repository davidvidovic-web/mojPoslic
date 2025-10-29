import { Link } from '@/i18n/navigation'
import packageJson from '../../../package.json'

export function GlobalFooter() {
  const currentYear = 2025 // Fixed year to prevent hydration mismatch
  const appVersion = packageJson.version
  
  return (
    <footer className="border-t bg-background mt-auto relative">
      <div className="container mx-auto px-4 py-6">
        {/* Copyright Bar */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>
              © {currentYear} mojPoslić. Sva prava zadržana.
            </p>
            <nav className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link href="/dokumentacija/politike/uslovi-koristenja" className="hover:text-foreground transition-colors">
                Uslovi korištenja
              </Link>
              <Link href="/dokumentacija/politike/politika-privatnosti" className="hover:text-foreground transition-colors">
                Politika privatnosti
              </Link>
              <span>v{appVersion}</span>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Keep the old export for backward compatibility
export const DashboardFooter = GlobalFooter
