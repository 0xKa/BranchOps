import { Badge } from "@/components/ui/badge";
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
import PageContainer, { PageHeader } from "@/layouts/page-container";
import { useBranches } from "@/features/branches/hooks/use-branches";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useLowStockAlerts } from "./hooks";
import type { LowStockAlert } from "./types";

export default function LowStockAlertsPage() {
    const [branchId, setBranchId] = useState("");

    const { data: alerts, isLoading } = useLowStockAlerts({
        branchId: branchId || undefined,
    });
    const { data: branches } = useBranches();

    return (
        <PageContainer>
            <PageHeader
                title="Low Stock Alerts"
                description="Products that are below their low stock threshold"
            />

            <div className="flex items-center gap-2 pb-2">
                <Select
                    value={branchId}
                    onValueChange={(v) => setBranchId(v === "all" ? "" : v)}
                >
                    <SelectTrigger className="w-55">
                        <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches?.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                                {b.displayName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <div className="rounded-md border">
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
            <TableCell className="text-center font-mono text-red-600">
                -{deficit}
            </TableCell>
        </TableRow>
    );
}
