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
import BranchFilter from "@/components/shared/branch-filter";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import {
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Package,
    Pencil,
    Plus,
    SlidersHorizontal,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import SetStockDialog from "./components/set-stock-dialog";
import AdjustStockDialog from "./components/adjust-stock-dialog";
import UpdateThresholdDialog from "./components/update-threshold-dialog";
import {
    useStock,
    useSetStock,
    useAdjustStock,
    useUpdateThreshold,
    useDeleteStock,
} from "./hooks";
import type { BranchStock } from "./types";

export default function StockLevelsPage() {
    const [page, setPage] = useState(1);
    const [branchId, setBranchId] = useState("");
    const pageSize = 20;

    const { data, isLoading } = useStock({ page, pageSize, branchId: branchId || undefined });
    const setStockMutation = useSetStock();
    const adjustMutation = useAdjustStock();
    const thresholdMutation = useUpdateThreshold();
    const deleteMutation = useDeleteStock();

    const [setStockOpen, setSetStockOpen] = useState(false);
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [thresholdStock, setThresholdStock] = useState<BranchStock | null>(null);
    const [deletingStock, setDeletingStock] = useState<BranchStock | null>(null);

    const items = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;

    return (
        <PageContainer>
            <PageHeader title="Stock Levels" description="View and manage inventory levels across branches">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAdjustOpen(true)}>
                        <SlidersHorizontal className="size-4 me-2" />
                        Adjust Stock
                    </Button>
                    <Button className="neon-glow" onClick={() => setSetStockOpen(true)}>
                        <Plus className="size-4 me-2" />
                        Set Stock
                    </Button>
                </div>
            </PageHeader>

            <div className="surface-1 flex items-center gap-2 rounded-xl border border-border/60 px-3 py-3">
                <BranchFilter
                    value={branchId}
                    onValueChange={(v) => {
                        setBranchId(v);
                        setPage(1);
                    }}
                    triggerClassName="w-55"
                />
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
                                    <TableHead>Product</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                    <TableHead className="text-center">Threshold</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length > 0 ? (
                                    items.map((stock) => (
                                        <StockRow
                                            key={stock.id}
                                            stock={stock}
                                            onEditThreshold={setThresholdStock}
                                            onDelete={setDeletingStock}
                                        />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Package className="size-8" />
                                                <p>No stock records found.</p>
                                            </div>
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

            <SetStockDialog
                open={setStockOpen}
                onOpenChange={setSetStockOpen}
                isPending={setStockMutation.isPending}
                onSubmit={(data) =>
                    setStockMutation.mutate(data, {
                        onSuccess: () => setSetStockOpen(false),
                    })
                }
            />

            <AdjustStockDialog
                open={adjustOpen}
                onOpenChange={setAdjustOpen}
                isPending={adjustMutation.isPending}
                onSubmit={(data) =>
                    adjustMutation.mutate(data, {
                        onSuccess: () => setAdjustOpen(false),
                    })
                }
            />

            <UpdateThresholdDialog
                open={!!thresholdStock}
                onOpenChange={(open) => !open && setThresholdStock(null)}
                stock={thresholdStock}
                isPending={thresholdMutation.isPending}
                onSubmit={(data) =>
                    thresholdStock &&
                    thresholdMutation.mutate(
                        { id: thresholdStock.id, data },
                        { onSuccess: () => setThresholdStock(null) },
                    )
                }
            />

            <DeleteConfirmDialog
                open={!!deletingStock}
                onOpenChange={(open) => !open && setDeletingStock(null)}
                title="Delete Stock Record"
                name={
                    deletingStock
                        ? `${deletingStock.productName} @ ${deletingStock.branchName}`
                        : ""
                }
                isPending={deleteMutation.isPending}
                onConfirm={() =>
                    deletingStock &&
                    deleteMutation.mutate(deletingStock.id, {
                        onSuccess: () => setDeletingStock(null),
                    })
                }
            />
        </PageContainer>
    );
}

function StockRow({
    stock,
    onEditThreshold,
    onDelete,
}: {
    stock: BranchStock;
    onEditThreshold: (stock: BranchStock) => void;
    onDelete: (stock: BranchStock) => void;
}) {
    return (
        <TableRow>
            <TableCell className="font-medium">{stock.productName}</TableCell>
            <TableCell>{stock.branchName}</TableCell>
            <TableCell className="text-center">{stock.quantity}</TableCell>
            <TableCell className="text-center">{stock.lowStockThreshold}</TableCell>
            <TableCell>
                {stock.isLowStock ? (
                    <Badge variant="destructive">Low Stock</Badge>
                ) : (
                    <Badge variant="default">In Stock</Badge>
                )}
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditThreshold(stock)}>
                            <Pencil className="size-4 me-2" />
                            Edit Threshold
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(stock)}
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
