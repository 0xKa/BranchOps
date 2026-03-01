import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useState } from "react";

// ─── shared field type ──────────────────────────────────────────
interface InfoField {
    label: string;
    value: React.ReactNode;
}

// ─── admin variant ──────────────────────────────────────────────
interface AdminCardData {
    kind: "admin";
    fullName: string;
    username: string;
    email: string | null;
    role: string;
    createdAt: string;
}

// ─── employee variant ───────────────────────────────────────────
interface EmployeeCardData {
    kind: "employee";
    fullName: string;
    username: string;
    phone: string | null;
    jobTitle: string | null;
    role: string;
    isActive: boolean;
    hiredAt: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export type UserCardData = AdminCardData | EmployeeCardData;

// ─── helpers ────────────────────────────────────────────────────
function initials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function fmtDate(iso: string | null | undefined) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function buildFields(data: UserCardData): InfoField[] {
    const common: InfoField[] = [
        { label: "Username", value: data.username },
        {
            label: "Role",
            value: <Badge variant="outline">{data.role}</Badge>,
        },
    ];

    if (data.kind === "admin") {
        return [
            ...common,
            { label: "Email", value: data.email ?? "—" },
            { label: "Created At", value: fmtDate(data.createdAt) },
        ];
    }

    return [
        ...common,
        { label: "Job Title", value: data.jobTitle ?? "—" },
        { label: "Phone", value: data.phone ?? "—" },
        {
            label: "Status",
            value: (
                <Badge variant={data.isActive ? "default" : "secondary"}>
                    {data.isActive ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        { label: "Hired At", value: fmtDate(data.hiredAt) },
        { label: "Notes", value: data.notes ?? "—" },
        { label: "Created At", value: fmtDate(data.createdAt) },
        { label: "Updated At", value: fmtDate(data.updatedAt) },
    ];
}

// ─── inner card (dialog body) ───────────────────────────────────
function UserCardContent({ data }: { data: UserCardData }) {
    const fields = buildFields(data);

    return (
        <div className="flex flex-col items-center gap-4">
            {/* avatar + name */}
            <Avatar size="lg">
                <AvatarFallback>{initials(data.fullName)}</AvatarFallback>
            </Avatar>

            <div className="text-center">
                <p className="text-sm font-semibold">{data.fullName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                    {data.kind}
                </p>
            </div>

            <Separator />

            {/* info grid */}
            <dl className="grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
                {fields.map((f) => (
                    <div key={f.label} className="contents">
                        <dt className="text-muted-foreground font-medium">
                            {f.label}
                        </dt>
                        <dd className="text-end">{f.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

// ─── controlled dialog ──────────────────────────────────────────
interface UserCardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: UserCardData;
}

export function UserCardDialog({
    open,
    onOpenChange,
    data,
}: UserCardDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>User Details</DialogTitle>
                </DialogHeader>
                <UserCardContent data={data} />
                <DialogFooter showCloseButton />
            </DialogContent>
        </Dialog>
    );
}

// ─── convenience trigger button ─────────────────────────────────
interface UserCardTriggerProps {
    data: UserCardData;
}

export function UserCardTrigger({ data }: UserCardTriggerProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                title="View user details"
            >
                <Eye className="size-4" />
            </Button>
            <UserCardDialog open={open} onOpenChange={setOpen} data={data} />
        </>
    );
}
