import { getAuthUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";

export default async function DeveloperMachinesPage() {
  const user = await getAuthUser();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>My Machines</h1>
          {user && <p className="text-muted-foreground mt-0.5">{user.name}</p>}
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
      <p className="text-sm text-muted-foreground">Developer view — coming soon</p>
    </div>
  );
}
