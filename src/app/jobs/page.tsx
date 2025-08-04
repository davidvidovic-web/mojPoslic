import { redirect } from 'next/navigation';

export default async function JobsPage() {
  // Redirect to homepage which has the comprehensive job listing
  redirect('/');
}
