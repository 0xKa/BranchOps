import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import BranchFilter from "@/components/shared/branch-filter";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { useState } from "react";
import { useStockAdjustments } from "./hooks";
import {
    STOCK_ADJUSTMENT_TYPE,
    type StockAdjustment,
    type StockAdjustmentType,
} from "./types";

const adjustmentTypeColors: Record<number, "default" | "secondary" | "destructive" | "outline"> = {
    1: "default",       // Restock
    2: "secondary",     // Sale
    3: "outline",       // Return
    4: "destructive",   // Damage
    5: "secondary",     // ManualAdjustment
    6: "outline",       // Transfer
};

export default function StockAdjustmentsPage() {
    const [page, setPage] = useState(1);
    const [branchId, setBranchId] = useState("");
    const [type, setType] = useState<StockAdjustmentType | "">("");
    const pageSize = 20;

    const { data, isLoading } = useStockAdjustments({
        page,
        pageSize,
        branchId: branchId || undefined,
        type: type || undefined,
    });

    const items = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;

    return (
        <PageContainer>
            <PageHeader
                title="Stock Adjustments"
                description="View the history of all stock changes"
            />

            <div className="flex items-center gap-2 pb-2">
                <BranchFilter
                    value={branchId}
                    onValueChange={(v) => {
                        setBranchId(v);
                        setPage(1);
                    }}
                    triggerClassName="w-55"
                />

                <Select
                    value={type ? String(type) : "all"}
                    onValueChange={(v) => {
                        setType(v === "all" ? "" : (Number(v) as StockAdjustmentType));
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-50">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(STOCK_ADJUSTMENT_TYPE).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                                {label}
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
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-center">Change</TableHead>
                                    <TableHead className="text-center">After</TableHead>
                                    <TableHead>Performed By</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length > 0 ? (
                                    items.map((adj) => (
                                        <AdjustmentRow key={adj.id} adjustment={adj} />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <ClipboardList className="size-8" />
                                                <p>No adjustments found.</p>
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
        </PageContainer>
    );
}

function AdjustmentRow({ adjustment }: { adjustment: StockAdjustment }) {
    const typeLabel = STOCK_ADJUSTMENT_TYPE[adjustment.type] ?? "Unknown";
    const color = adjustmentTypeColors[adjustment.type] ?? "secondary";

    return (
        <TableRow>
            <TableCell className="text-sm">
                {new Date(adjustment.createdAt).toLocaleString()}
            </TableCell>
            <TableCell className="font-medium">{adjustment.productName}</TableCell>
            <TableCell>{adjustment.branchName}</TableCell>
            <TableCell>
                <Badge variant={color}>{typeLabel}</Badge>
            </TableCell>
            <TableCell className="text-center font-mono">
                <span
                    className={
                        adjustment.quantityChange > 0
                            ? "text-green-600"
                            : adjustment.quantityChange < 0
                                ? "text-red-600"
                                : ""
                    }
                >
                    {adjustment.quantityChange > 0 ? "+" : ""}
                    {adjustment.quantityChange}
                </span>
            </TableCell>
            <TableCell className="text-center font-mono">
                {adjustment.quantityAfter}
            </TableCell>
            <TableCell>{adjustment.performedByUserName ?? "—"}</TableCell>
            <TableCell className="max-w-50 truncate">
                {adjustment.notes ?? "—"}
            </TableCell>
        </TableRow>
    );
}
