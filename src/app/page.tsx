import { ConditionalHeader } from "@/components/core/conditional-header";
import { ConditionalFooter } from "@/components/core/conditional-footer";
import HomePage from './[locale]/page';

export default async function RootPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <ConditionalHeader />
      <main className="flex-1">
        <HomePage />
      </main>
      <ConditionalFooter />
    </div>
  );
}
