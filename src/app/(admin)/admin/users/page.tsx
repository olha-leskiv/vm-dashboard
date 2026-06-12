import { Info } from "lucide-react";
import { MOCK_USERS } from "@/mocks/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

const ROLE_STYLES = {
  admin: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  engineer: "bg-muted text-muted-foreground border-transparent",
} as const;

export default function AdminUsersPage() {
  const users = [...MOCK_USERS].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Directory of workspace members."
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-base">All users</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="size-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>All workspace members and their assigned VMs</TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-md border overflow-x-auto max-h-[min(70vh,720px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px] uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider">Email</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider">Role</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-right">VMs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-sm">{u.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] py-0 h-4 px-1.5 capitalize", ROLE_STYLES[u.role])}
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{u.vmCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
