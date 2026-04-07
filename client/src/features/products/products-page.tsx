import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import {
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import CreateProductDialog from "./components/create-product-dialog";
import EditProductDialog from "./components/edit-product-dialog";
import {
    useProducts,
    useCreateProduct,
    useDeleteProduct,
    useUpdateProduct,
} from "./hooks";
import type { Product } from "./types";

export default function ProductsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const pageSize = 20;

    const { data, isLoading } = useProducts({ page, pageSize, search });
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();

    const [createOpen, setCreateOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    const products = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;

    return (
        <PageContainer>
            <PageHeader title="Products" description="Manage your product catalog">
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4 me-2" />
                    Add Product
                </Button>
            </PageHeader>

            <div className="surface-1 flex items-center gap-2 rounded-xl border border-border/60 px-3 py-3">
                <div className="relative max-w-sm">
                    <Search className="absolute inset-s-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="ps-9"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <>
                    <div className="surface-1 overflow-hidden rounded-xl border border-border/60">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <ProductRow
                                            key={product.id}
                                            product={product}
                                            onEdit={setEditingProduct}
                                            onDelete={setDeletingProduct}
                                        />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            No products found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-sm text-muted-foreground">
                                Page {page} of {totalPages} ({data?.totalCount ?? 0} total)
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <CreateProductDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                isPending={createMutation.isPending}
                onSubmit={(data) =>
                    createMutation.mutate(data, {
                        onSuccess: () => setCreateOpen(false),
                    })
                }
            />

            <EditProductDialog
                open={!!editingProduct}
                onOpenChange={(open) => !open && setEditingProduct(null)}
                product={editingProduct}
                isPending={updateMutation.isPending}
                onSubmit={(data) =>
                    editingProduct &&
                    updateMutation.mutate(
                        { id: editingProduct.id, data },
                        { onSuccess: () => setEditingProduct(null) },
                    )
                }
            />

            <DeleteConfirmDialog
                open={!!deletingProduct}
                onOpenChange={(open) => !open && setDeletingProduct(null)}
                title="Delete Product"
                name={deletingProduct?.name ?? ""}
                isPending={deleteMutation.isPending}
                onConfirm={() =>
                    deletingProduct &&
                    deleteMutation.mutate(deletingProduct.id, {
                        onSuccess: () => setDeletingProduct(null),
                    })
                }
            />
        </PageContainer>
    );
}

function ProductRow({
    product,
    onEdit,
    onDelete,
}: {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
}) {
    return (
        <TableRow>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.categoryName}</TableCell>
            <TableCell>{product.price.toFixed(3)}</TableCell>
            <TableCell>{product.cost != null ? product.cost.toFixed(3) : "—"}</TableCell>
            <TableCell>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Pencil className="size-4 me-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(product)}
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
