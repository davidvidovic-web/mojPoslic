import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ConditionalHeader } from "@/components/core/conditional-header";
import { ConditionalFooter } from "@/components/core/conditional-footer";
import HomePage from './[locale]/page';

export default async function RootPage() {
  // For domain-based routing, provide the full locale layout for the default locale (Bosnian)
  const messages = await getMessages({ locale: 'bs' });
  
  return (
    <NextIntlClientProvider messages={messages} locale="bs">
      <div className="relative flex min-h-screen flex-col">
        <ConditionalHeader />
        <main className="flex-1">
          <HomePage />
        </main>
        <ConditionalFooter />
      </div>
    </NextIntlClientProvider>
  );
}
