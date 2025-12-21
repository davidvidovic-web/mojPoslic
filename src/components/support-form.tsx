'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, CheckCircle } from 'lucide-react'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { toast } from 'sonner'

interface SupportFormProps {
  className?: string
}

export function SupportForm({ className }: SupportFormProps) {
  const { user } = useSupabaseAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    message: '',
    website: '' // honeypot field
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Honeypot check - if filled, it's likely a bot
    if (formData.website) {
      console.log('Honeypot triggered - potential bot submission')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: formData.type,
          message: formData.message,
          userEmail: user?.email,
          userName: user?.name,
          website: formData.website
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setIsSubmitted(true)
        // Reset form
        setFormData({ type: '', message: '', website: '' })
        toast.success('Poruka je uspješno poslana')
      } else {
        console.error('Failed to send support request:', result.error)
        toast.error('Greška pri slanju poruke. Molimo pokušajte ponovo.')
      }
    } catch (error) {
      console.error('Error sending support request:', error)
      toast.error('Greška pri slanju poruke. Molimo pokušajte ponovo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (isSubmitted) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
            <h3 className="text-xl font-semibold">Poruka je poslana</h3>
            <p className="text-muted-foreground">
              Vaša poruka je uspješno poslana našem timu podrške. Odgovorit ćemo vam što je prije moguće.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setIsSubmitted(false)}
              className="mt-4"
            >
              Pošaljite novu poruku
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Kontaktirajte nas</CardTitle>
        <CardDescription>
          Pošaljite nam vaše pitanje, prijedlog ili prijavite grešku
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hidden email field - autopopulated */}
          <input 
            type="hidden" 
            name="email" 
            value={user?.email || ''} 
          />

          {/* Honeypot field - hidden from users */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Tip zahtjeva
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">Odaberite tip zahtjeva</option>
              <option value="Prijavi gresku">Prijavi grešku</option>
              <option value="Pitanje">Pitanje</option>
              <option value="Prijedlog">Prijedlog</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Poruka
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Opišite vaš zahtjev detaljno..."
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          {user?.email && (
            <div className="text-sm text-muted-foreground">
              Poruka će biti poslana sa vašeg email-a: {user.email}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Šalje se...' : 'Pošaljite poruku'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}