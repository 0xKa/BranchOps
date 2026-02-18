import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteConfirmDialog from "@/components/shared/delete-confirm-dialog";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import CreateBranchDialog from "./components/create-branch-dialog";
import EditBranchDialog from "./components/edit-branch-dialog";
import {
  useBranches,
  useCreateBranch,
  useDeleteBranch,
  useUpdateBranch,
} from "./hooks/index";
import type { Branch } from "./types";

export default function BranchesPage() {
  const { data: branches, isLoading } = useBranches();
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const deleteMutation = useDeleteBranch();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  return (
    <PageContainer>
      <PageHeader title="Branches" description="Manage branch locations">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 me-2" />
          Add Branch
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
                <TableHead>Code</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches && branches.length > 0 ? (
                branches.map((branch) => (
                  <BranchRow
                    key={branch.id}
                    branch={branch}
                    onEdit={setEditingBranch}
                    onDelete={setDeletingBranch}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No branches found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateBranchDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isPending={createMutation.isPending}
        onSubmit={(data) =>
          createMutation.mutate(data, {
            onSuccess: () => setCreateOpen(false),
          })
        }
      />

      <EditBranchDialog
        open={!!editingBranch}
        onOpenChange={(open) => !open && setEditingBranch(null)}
        branch={editingBranch}
        isPending={updateMutation.isPending}
        onSubmit={(data) =>
          editingBranch &&
          updateMutation.mutate(
            { id: editingBranch.id, data },
            { onSuccess: () => setEditingBranch(null) },
          )
        }
      />

      <DeleteConfirmDialog
        open={!!deletingBranch}
        onOpenChange={(open) => !open && setDeletingBranch(null)}
        title="Delete Branch"
        name={deletingBranch?.displayName ?? ""}
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          deletingBranch &&
          deleteMutation.mutate(deletingBranch.id, {
            onSuccess: () => setDeletingBranch(null),
          })
        }
      />
    </PageContainer>
  );
}

function BranchRow({
  branch,
  onEdit,
  onDelete,
}: {
  branch: Branch;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{branch.code}</TableCell>
      <TableCell>{branch.displayName}</TableCell>
      <TableCell>{branch.city ?? "—"}</TableCell>
      <TableCell>{branch.country ?? "—"}</TableCell>
      <TableCell>
        <Badge variant={branch.isActive ? "default" : "secondary"}>
          {branch.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(branch)}>
              <Pencil className="size-4 me-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(branch)}
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
