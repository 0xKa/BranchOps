import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    Ban,
    ChevronLeft,
    ChevronRight,
    Eye,
    MoreHorizontal,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import CancelOrderDialog from "./components/cancel-order-dialog";
import OrderDetailDialog from "./components/order-detail-dialog";
import { useCancelOrder, useDeleteOrder, useOrders } from "./hooks";
import {
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    PAYMENT_METHOD_LABELS,
    type OrderStatus,
    type OrderSummary,
} from "./types";

export default function OrderHistoryPage() {
    const [page, setPage] = useState(1);
    const [branchFilter, setBranchFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const pageSize = 20;

    const { data, isLoading } = useOrders({
        page,
        pageSize,
        branchId: branchFilter || undefined,
        status: statusFilter
            ? (Number(statusFilter) as OrderStatus)
            : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
    });

    const cancelMutation = useCancelOrder();
    const deleteMutation = useDeleteOrder();

    const orders = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;

    const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
        null,
    );
    const [deletingOrder, setDeletingOrder] = useState<OrderSummary | null>(
        null,
    );

    return (
        <PageContainer>
            <PageHeader
                title="Order History"
                description="View and manage past orders"
            />

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3 pb-2">
                <div className="space-y-1">
                    <Label className="text-xs">Branch</Label>
                    <BranchFilter
                        value={branchFilter}
                        onValueChange={(v) => {
                            setBranchFilter(v);
                            setPage(1);
                        }}
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Status</Label>
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => {
                            setStatusFilter(v === "all" ? "" : v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {Object.entries(ORDER_STATUS).map(
                                ([_label, value]) => (
                                    <SelectItem
                                        key={value}
                                        value={String(value)}
                                    >
                                        {ORDER_STATUS_LABELS[value]}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">From</Label>
                    <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                            setFromDate(e.target.value);
                            setPage(1);
                        }}
                        className="w-36 h-8 text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">To</Label>
                    <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                            setToDate(e.target.value);
                            setPage(1);
                        }}
                        className="w-36 h-8 text-xs"
                    />
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Payment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <OrderRow
                                            key={order.id}
                                            order={order}
                                            onView={() =>
                                                setViewingOrderId(order.id)
                                            }
                                            onCancel={() =>
                                                setCancellingOrderId(order.id)
                                            }
                                            onDelete={() =>
                                                setDeletingOrder(order)
                                            }
                                        />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-8"
                                        >
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-sm text-muted-foreground">
                                Page {page} of {totalPages} (
                                {data?.totalCount ?? 0} total)
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

            {/* Detail Dialog */}
            <OrderDetailDialog
                open={!!viewingOrderId}
                onOpenChange={(open) => !open && setViewingOrderId(null)}
                orderId={viewingOrderId}
            />

            {/* Cancel Dialog */}
            <CancelOrderDialog
                open={!!cancellingOrderId}
                onOpenChange={(open) => !open && setCancellingOrderId(null)}
                isPending={cancelMutation.isPending}
                onConfirm={(reason) =>
                    cancellingOrderId &&
                    cancelMutation.mutate(
                        { id: cancellingOrderId, reason },
                        { onSuccess: () => setCancellingOrderId(null) },
                    )
                }
            />

            {/* Delete Dialog */}
            <DeleteConfirmDialog
                open={!!deletingOrder}
                onOpenChange={(open) => !open && setDeletingOrder(null)}
                title="Delete Order"
                name={
                    deletingOrder
                        ? `order from ${new Date(deletingOrder.createdAt).toLocaleDateString()}`
                        : ""
                }
                isPending={deleteMutation.isPending}
                onConfirm={() =>
                    deletingOrder &&
                    deleteMutation.mutate(deletingOrder.id, {
                        onSuccess: () => setDeletingOrder(null),
                    })
                }
            />
        </PageContainer>
    );
}

function OrderRow({
    order,
    onView,
    onCancel,
    onDelete,
}: {
    order: OrderSummary;
    onView: () => void;
    onCancel: () => void;
    onDelete: () => void;
}) {
    const isPaid = order.status === ORDER_STATUS.Paid;

    return (
        <TableRow>
            <TableCell className="text-sm">
                {new Date(order.createdAt).toLocaleString()}
            </TableCell>
            <TableCell>{order.branchName}</TableCell>
            <TableCell>{order.itemCount}</TableCell>
            <TableCell className="font-medium">
                {order.total.toFixed(3)}
            </TableCell>
            <TableCell>
                {PAYMENT_METHOD_LABELS[order.paymentMethod]}
            </TableCell>
            <TableCell>
                <Badge variant={isPaid ? "default" : "destructive"}>
                    {ORDER_STATUS_LABELS[order.status]}
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
                        <DropdownMenuItem onClick={onView}>
                            <Eye className="size-4 me-2" />
                            View Details
                        </DropdownMenuItem>
                        {isPaid && (
                            <DropdownMenuItem onClick={onCancel}>
                                <Ban className="size-4 me-2" />
                                Cancel Order
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={onDelete}
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
