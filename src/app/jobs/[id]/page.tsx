import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { JobDetails } from '@/components/jobs/job-details'
import { ConditionalHeader } from "@/components/core/conditional-header";
import { ConditionalFooter } from "@/components/core/conditional-footer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  
  // Get messages for the default locale (bs)
  const messages = await getMessages({ locale: 'bs' });
  
  return (
    <NextIntlClientProvider messages={messages} locale="bs">
      <div className="relative flex min-h-screen flex-col">
        <ConditionalHeader />
        <main className="flex-1">
          <JobDetails jobId={id} />
        </main>
        <ConditionalFooter />
      </div>
    </NextIntlClientProvider>
  );
}
