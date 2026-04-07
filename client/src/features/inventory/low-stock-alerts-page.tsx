import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import BranchFilter from "@/components/shared/branch-filter";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useLowStockAlerts } from "./hooks";
import type { LowStockAlert } from "./types";

export default function LowStockAlertsPage() {
    const [branchId, setBranchId] = useState("");

    const { data: alerts, isLoading } = useLowStockAlerts({
        branchId: branchId || undefined,
    });

    return (
        <PageContainer>
            <PageHeader
                title="Low Stock Alerts"
                description="Products that are below their low stock threshold"
            />

            <div className="surface-1 flex items-center gap-2 rounded-xl border border-border/60 px-3 py-3">
                <BranchFilter
                    value={branchId}
                    onValueChange={setBranchId}
                    triggerClassName="w-55"
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <div className="surface-1 overflow-hidden rounded-xl border border-border/60">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead className="text-center">Current Qty</TableHead>
                                <TableHead className="text-center">Threshold</TableHead>
                                <TableHead className="text-center">Deficit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts && alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <AlertRow key={alert.branchStockId} alert={alert} />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <AlertTriangle className="size-8" />
                                            <p>No low stock alerts. All products are sufficiently stocked.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </PageContainer>
    );
}

function AlertRow({ alert }: { alert: LowStockAlert }) {
    const deficit = alert.lowStockThreshold - alert.quantity;

    return (
        <TableRow>
            <TableCell className="font-medium">{alert.productName}</TableCell>
            <TableCell>{alert.branchName}</TableCell>
            <TableCell className="text-center">
                <Badge variant="destructive">{alert.quantity}</Badge>
            </TableCell>
            <TableCell className="text-center">{alert.lowStockThreshold}</TableCell>
            <TableCell className="text-center font-mono text-status-danger">
                -{deficit}
            </TableCell>
        </TableRow>
    );
}
