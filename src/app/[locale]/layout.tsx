import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ConditionalHeader } from "@/components/core/conditional-header";
import { ConditionalFooter } from "@/components/core/conditional-footer";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: Props) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'en' | 'bs')) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="relative flex min-h-screen flex-col">
        <ConditionalHeader />
        <main className="flex-1">
          {children}
        </main>
        <ConditionalFooter />
      </div>
    </NextIntlClientProvider>
  );
}
