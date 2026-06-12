import Image from "next/image";
import { RoleSelector } from "./role-selector";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg px-4 space-y-8">

        <div className="text-center space-y-4">

          <div className="space-y-4">
            <h1>Sign in</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              <span className="font-medium text-foreground">Test mode.</span> In production this page would show an SSO or OAuth flow. For now, pick a role below to simulate sign in. Access automatically granted by organization admin.
            </p>
          </div>
        </div>

        <RoleSelector />
      </div>
    </main >
  );
}
