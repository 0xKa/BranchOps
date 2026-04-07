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
import CreateCategoryDialog from "./components/create-category-dialog";
import EditCategoryDialog from "./components/edit-category-dialog";
import {
    useCategories,
    useCreateCategory,
    useDeleteCategory,
    useUpdateCategory,
} from "./hooks";
import type { ProductCategory } from "../types";

export default function CategoriesPage() {
    const { data: categories, isLoading } = useCategories();
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    const [createOpen, setCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<ProductCategory | null>(null);
    const [deletingCategory, setDeletingCategory] =
        useState<ProductCategory | null>(null);

    return (
        <PageContainer>
            <PageHeader
                title="Categories"
                description="Manage product categories"
            >
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4 me-2" />
                    Add Category
                </Button>
            </PageHeader>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <div className="surface-1 overflow-hidden rounded-xl border border-border/60">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories && categories.length > 0 ? (
                                categories.map((category) => (
                                    <CategoryRow
                                        key={category.id}
                                        category={category}
                                        onEdit={setEditingCategory}
                                        onDelete={setDeletingCategory}
                                    />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            <CreateCategoryDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                isPending={createMutation.isPending}
                onSubmit={(data) =>
                    createMutation.mutate(data, {
                        onSuccess: () => setCreateOpen(false),
                    })
                }
            />

            <EditCategoryDialog
                open={!!editingCategory}
                onOpenChange={(open) => !open && setEditingCategory(null)}
                category={editingCategory}
                isPending={updateMutation.isPending}
                onSubmit={(data) =>
                    editingCategory &&
                    updateMutation.mutate(
                        { id: editingCategory.id, data },
                        { onSuccess: () => setEditingCategory(null) },
                    )
                }
            />

            <DeleteConfirmDialog
                open={!!deletingCategory}
                onOpenChange={(open) => !open && setDeletingCategory(null)}
                title="Delete Category"
                name={deletingCategory?.name ?? ""}
                isPending={deleteMutation.isPending}
                onConfirm={() =>
                    deletingCategory &&
                    deleteMutation.mutate(deletingCategory.id, {
                        onSuccess: () => setDeletingCategory(null),
                    })
                }
            />
        </PageContainer>
    );
}

function CategoryRow({
    category,
    onEdit,
    onDelete,
}: {
    category: ProductCategory;
    onEdit: (category: ProductCategory) => void;
    onDelete: (category: ProductCategory) => void;
}) {
    return (
        <TableRow>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell>{category.productCount}</TableCell>
            <TableCell>
                <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                            <Pencil className="size-4 me-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(category)}
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
