import { useState } from "react";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useAdmins, useRegisterAdmin, useDeleteAdmin } from "./hooks/index";
import type { AdminRegisterResponse } from "./types";
import CreateAdminDialog from "./components/create-admin-dialog";
import DeleteConfirmDialog from "./components/delete-confirm-dialog";

export default function AdminsPage() {
  const { data: admins, isLoading } = useAdmins();
  const registerMutation = useRegisterAdmin();
  const deleteMutation = useDeleteAdmin();

  const [createOpen, setCreateOpen] = useState(false);
  const [deletingAdmin, setDeletingAdmin] =
    useState<AdminRegisterResponse | null>(null);

  return (
    <PageContainer>
      <PageHeader title="Admins" description="Manage administrator accounts">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 me-2" />
          Add Admin
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins && admins.length > 0 ? (
                admins.map((admin) => (
                  <AdminRow
                    key={admin.id}
                    admin={admin}
                    onDelete={setDeletingAdmin}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No admins found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateAdminDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isPending={registerMutation.isPending}
        onSubmit={(data) =>
          registerMutation.mutate(data, {
            onSuccess: () => setCreateOpen(false),
          })
        }
      />

      <DeleteConfirmDialog
        open={!!deletingAdmin}
        onOpenChange={(open) => !open && setDeletingAdmin(null)}
        title="Delete Admin"
        name={deletingAdmin?.fullName ?? deletingAdmin?.username ?? ""}
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          deletingAdmin &&
          deleteMutation.mutate(deletingAdmin.id, {
            onSuccess: () => setDeletingAdmin(null),
          })
        }
      />
    </PageContainer>
  );
}

function AdminRow({
  admin,
  onDelete,
}: {
  admin: AdminRegisterResponse;
  onDelete: (admin: AdminRegisterResponse) => void;
}) {
  return (
    <TableRow>
      <TableCell>{admin.username}</TableCell>
      <TableCell>{admin.email ?? "—"}</TableCell>
      <TableCell>
        <Badge variant="outline">{admin.role}</Badge>
      </TableCell>
      <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(admin)}
            >
              <Trash2 className="size-4 me-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
