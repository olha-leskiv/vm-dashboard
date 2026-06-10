import { RoleSelector } from "./role-selector";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm px-4 space-y-8">
        <div className="text-center space-y-1">
          <h1>Ascendra Workspaces</h1>
          <p className="text-muted-foreground">Select your role to continue. Sign in to the account.</p>
        </div>
        <RoleSelector />
      </div>
    </main>
  );
}
