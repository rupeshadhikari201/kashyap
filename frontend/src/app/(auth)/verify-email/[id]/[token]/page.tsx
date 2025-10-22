"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const params = useParams(); // id and token
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  console.log(`${params.id}/${params.token}`);
  useEffect(() => {
    console.log(`${params.id}/${params.token}`);
    // Verify that the required parameters are present else return early
    if (!params.id || !params.token) return;
    
    const verifyEmail = async () => {
      try {
        // await authAPI.verifyEmail(params.token as string);
        await authAPI.verifyEmail(`${params.id}/${params.token}`);
        
        setVerified(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Email verification failed. The link may be invalid or expired.');
      } finally {
        setVerifying(false);
      }
    };

    // if (params.token) {
      verifyEmail();
    // }
  }, [params.token, router]);

  if (verifying) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </div>
          <CardTitle className="text-2xl">Verifying Email</CardTitle>
          <CardDescription>
            Please wait while we verify your email address...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (verified) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Email Verified!</CardTitle>
          <CardDescription>
            Your email has been successfully verified
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Redirecting you to login page...
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="h-16 w-16 text-destructive" />
        </div>
        <CardTitle className="text-2xl">Verification Failed</CardTitle>
        <CardDescription>
          {error}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-center">
        <Link href="/login">
          <Button>Go to Login</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}