import { prisma } from '@repo/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAllFlags } from '~/utils/feature-flags';
import { LoginButton } from './_components/LoginButton';

// @TODO: add a redirect param to send users back to previous page
export default async function Index({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const flags = await getAllFlags();
  const token = searchParams.token ?? '';
  const validToken = await validateToken(token);

  if (!validToken && flags.enableEarlyAccess) {
    return redirect('/');
  }

  return (
    <>
      <div className="container flex h-full flex-col items-center justify-center">
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 text-center sm:w-[450px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Welcome to Early Access!
              </h1>
              <p className="text-muted-foreground text-sm">
                Start your typescript journey by logging in below.
              </p>
            </div>
            <LoginButton token={validToken} shouldClaimToken={flags.enableEarlyAccess} />
            <p className="text-muted-foreground mx-auto px-8 text-sm sm:w-[350px]">
              By clicking continue, you agree to our{' '}
              <Link href="/tos" className="hover:text-primary underline underline-offset-4">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="hover:text-primary underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export type Token = NonNullable<Awaited<ReturnType<typeof validateToken>>>;
async function validateToken(token: string) {
  return prisma.betaTokens.findUnique({ where: { token, isClaimed: false } });
}
