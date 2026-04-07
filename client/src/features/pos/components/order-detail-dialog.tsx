import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useOrder } from "../hooks";
import {
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    PAYMENT_METHOD_LABELS,
} from "../types";

interface OrderDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderId: string | null;
}

export default function OrderDetailDialog({
    open,
    onOpenChange,
    orderId,
}: OrderDetailDialogProps) {
    const { data: order, isLoading } = useOrder(open ? orderId : null);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="surface-1 max-h-[85vh] max-w-2xl overflow-y-auto border-border/60 shadow-glow-subtle">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>
                        {order
                            ? `Order from ${new Date(order.createdAt).toLocaleString()}`
                            : "Loading order..."}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Spinner className="size-6" />
                    </div>
                ) : order ? (
                    <div className="space-y-4">
                        {/* Header Info */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-muted-foreground">
                                    Branch
                                </span>
                                <p className="font-medium">
                                    {order.branchName}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Created By
                                </span>
                                <p className="font-medium">
                                    {order.createdByUserName}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Status
                                </span>
                                <div>
                                    <Badge
                                        variant={
                                            order.status === ORDER_STATUS.Paid
                                                ? "default"
                                                : "destructive"
                                        }
                                    >
                                        {ORDER_STATUS_LABELS[order.status]}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">
                                    Payment
                                </span>
                                <p className="font-medium">
                                    {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                                </p>
                            </div>
                        </div>

                        <Separator className="bg-border/70" />

                        {/* Items Table */}
                        <div className="surface-1 overflow-hidden rounded-xl border border-border/60">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead className="text-end">
                                            Price
                                        </TableHead>
                                        <TableHead className="text-end">
                                            Qty
                                        </TableHead>
                                        <TableHead className="text-end">
                                            Total
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {order.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">
                                                {item.productName}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                {item.unitPrice.toFixed(3)}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                {item.lineTotal.toFixed(3)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Totals */}
                        <div className="surface-1 ms-auto max-w-xs space-y-1 rounded-lg border border-border/60 px-3 py-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>{order.subtotal.toFixed(3)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Discount
                                    </span>
                                    <span className="text-destructive">
                                        -{order.discount.toFixed(3)}
                                    </span>
                                </div>
                            )}
                            {order.tax > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Tax
                                    </span>
                                    <span>+{order.tax.toFixed(3)}</span>
                                </div>
                            )}
                            <Separator className="bg-border/70" />
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span>{order.total.toFixed(3)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Amount Paid
                                </span>
                                <span>{order.amountPaid.toFixed(3)}</span>
                            </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                            <>
                                <Separator className="bg-border/70" />
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Notes
                                    </span>
                                    <p className="text-sm mt-1">
                                        {order.notes}
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Cancellation Info */}
                        {order.cancelledByUserName && (
                            <>
                                <Separator className="bg-border/70" />
                                <div className="rounded-lg border border-destructive/35 bg-destructive/12 px-3 py-2 text-sm text-destructive">
                                    Cancelled by {order.cancelledByUserName}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-4">
                        Order not found.
                    </p>
                )}
            </DialogContent>
        </Dialog>
    );
}
