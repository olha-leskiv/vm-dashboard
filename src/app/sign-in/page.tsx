import Image from "next/image";
import { RoleSelector } from "./role-selector";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg px-4 space-y-8">

        {/* Logo + title */}
        <div className="text-center space-y-4">
          <Image
            src="/ascendra-logo.svg"
            alt="Ascendra"
            width={211}
            height={64}
            className="h-8 w-auto mx-auto"
            priority
            unoptimized
          />
          <div className="space-y-1.5">
            <h1>Sign in</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Access is granted by your organization admin. Once approved, you'll be redirected automatically based on your account type.
            </p>
          </div>
        </div>

        {/* Dev shortcut notice */}
        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Test mode.</span> In production this page would show an SSO or OAuth flow. For now, pick a role below to simulate sign in.
          </p>
        </div>

        <RoleSelector />
      </div>
    </main>
  );
}
