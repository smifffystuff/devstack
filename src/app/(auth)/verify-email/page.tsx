import { VerifyEmailStatus } from '@/components/auth/VerifyEmailStatus';

interface VerifyEmailPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { status } = await searchParams;
  return <VerifyEmailStatus status={status ?? null} />;
}
