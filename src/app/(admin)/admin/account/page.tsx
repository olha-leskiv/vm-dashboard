import { signOut } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground text-sm">
      <p>Account page — to be developed</p>
      <form action={signOut}>
        <Button type="submit" >
          Sign out
        </Button>
      </form>
    </div>
  );
}
