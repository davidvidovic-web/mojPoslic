'use client'

import { useLocale } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'
import { useCreateTransferToken } from '@/hooks/use-misc-apis'

const LanguageSwitcherMigrated = () => {
  const locale = useLocale()
  const { mutate: createTransferToken, isPending: isCreatingToken } = useCreateTransferToken()

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return

    // Use the Supabase hook instead of manual fetch()
    createTransferToken(newLocale)
  }

  return (
    <Select 
      value={locale} 
      onValueChange={handleLanguageChange}
      disabled={isCreatingToken}
    >
      <SelectTrigger className="w-auto min-w-[100px] border-0 bg-transparent hover:bg-gray-100">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="bs" className="flex items-center gap-2">
          <span className="text-lg">🇧🇦</span>
          <span>Bosanski</span>
        </SelectItem>
        <SelectItem value="en" className="flex items-center gap-2">
          <span className="text-lg">🇺🇸</span>
          <span>English</span>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}

export default LanguageSwitcherMigrated
