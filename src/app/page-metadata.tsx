import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'mojPoslić - Platforma za male poslove | Prijava, Registracija, Dokumentacija',
  description: 'Brza platforma za male poslove u BiH. Pronađite radnike ili poslove za kratak rad, dnevne zadatke i privremene usluge. Direktna komunikacija, brza aplikacija i sigurno plaćanje.',
  alternates: {
    canonical: 'https://mojposlic.com',
  }
}

export default function RootPageMetadata() {
  // This component exists only to set metadata for the root page
  return null
}