'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  if (status === 'success') {
    return (
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2">
            <CheckCircle2 className="size-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Email Verified</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your email has been verified. You can now sign in to your account.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/sign-in">
            <Button>Sign in</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (status === 'expired') {
    return (
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2">
            <Clock className="size-12 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Link Expired</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This verification link has expired. Please register again to receive a new link.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/register">
            <Button variant="outline">Register again</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (status === 'invalid') {
    return (
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2">
            <XCircle className="size-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Invalid Link</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This verification link is invalid. It may have already been used.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href="/sign-in">
            <Button variant="outline">Go to sign in</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Default: "check your email" state (after registration)
  return (
    <Card className="w-full max-w-sm text-center">
      <CardHeader>
        <div className="mx-auto mb-2">
          <Mail className="size-12 text-blue-500" />
        </div>
        <CardTitle className="text-2xl">Check your email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground">
          We&apos;ve sent a verification link to your email address. Click the link to activate your account.
        </p>
        <p className="text-sm text-muted-foreground">
          The link expires in 24 hours. Check your spam folder if you don&apos;t see it.
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Already verified?{' '}
          <Link href="/sign-in" className="text-foreground underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
