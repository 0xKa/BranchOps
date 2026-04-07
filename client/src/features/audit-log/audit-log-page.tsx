import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import PageContainer, { PageHeader } from "@/layouts/page-container";
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    LogIn,
    Pencil,
    Plus,
    Trash2,
    User,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuditLogs, useAuditActions, useAuditEntityTypes } from "./hooks";

const ACTION_ICON: Record<string, React.ReactNode> = {
    Create: <Plus className="size-3.5 text-action-create" />,
    Update: <Pencil className="size-3.5 text-action-update" />,
    Delete: <Trash2 className="size-3.5 text-action-delete" />,
    Login: <LogIn className="size-3.5 text-action-login" />,
};

const ACTION_VARIANT: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
> = {
    Create: "secondary",
    Update: "secondary",
    Delete: "destructive",
    Login: "outline",
};

export default function AuditLogPage() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState("");
    const [entityTypeFilter, setEntityTypeFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const pageSize = 20;

    const { data: actions } = useAuditActions();
    const { data: entityTypes } = useAuditEntityTypes();

    const { data, isLoading } = useAuditLogs({
        page,
        pageSize,
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
    });

    const logs = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;

    return (
        <PageContainer>
            <PageHeader
                title={t("auditLog.title")}
                description={t("auditLog.description")}
            />

            {/* Filters */}
            <div className="surface-1 flex flex-wrap items-end gap-3 rounded-xl border border-border/60 px-3 py-3">
                <div className="space-y-1">
                    <Label className="text-xs">{t("auditLog.action")}</Label>
                    <Select
                        value={actionFilter}
                        onValueChange={(v) => {
                            setActionFilter(v === "all" ? "" : v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue
                                placeholder={t("auditLog.allActions")}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t("auditLog.allActions")}
                            </SelectItem>
                            {(actions ?? []).map((a) => (
                                <SelectItem key={a} value={a}>
                                    {a}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs">
                        {t("auditLog.entityType")}
                    </Label>
                    <Select
                        value={entityTypeFilter}
                        onValueChange={(v) => {
                            setEntityTypeFilter(v === "all" ? "" : v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-40 h-8 text-xs">
                            <SelectValue
                                placeholder={t("auditLog.allEntityTypes")}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t("auditLog.allEntityTypes")}
                            </SelectItem>
                            {(entityTypes ?? []).map((e) => (
                                <SelectItem key={e} value={e}>
                                    {e}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1">
                    <Label className="text-xs">{t("auditLog.from")}</Label>
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
                    <Label className="text-xs">{t("auditLog.to")}</Label>
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
                    <div className="surface-1 overflow-hidden rounded-xl border border-border/60">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-44">
                                        {t("auditLog.timestamp")}
                                    </TableHead>
                                    <TableHead>
                                        {t("auditLog.user")}
                                    </TableHead>
                                    <TableHead className="w-28">
                                        {t("auditLog.action")}
                                    </TableHead>
                                    <TableHead className="w-32">
                                        {t("auditLog.entityType")}
                                    </TableHead>
                                    <TableHead>
                                        {t("auditLog.details")}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="size-3.5" />
                                                    {new Date(
                                                        log.timestamp,
                                                    ).toLocaleString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="size-3.5 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {log.username ??
                                                            t(
                                                                "auditLog.system",
                                                            )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        ACTION_VARIANT[
                                                        log.action
                                                        ] ?? "outline"
                                                    }
                                                    className="gap-1"
                                                >
                                                    {ACTION_ICON[log.action] ?? (
                                                        <FileText className="size-3.5" />
                                                    )}
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {log.entityType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm max-w-md truncate">
                                                {log.details}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-8"
                                        >
                                            {t("auditLog.noData")}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-sm text-muted-foreground">
                                {t("auditLog.pageInfo", {
                                    page,
                                    totalPages,
                                    total: data?.totalCount ?? 0,
                                })}
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
