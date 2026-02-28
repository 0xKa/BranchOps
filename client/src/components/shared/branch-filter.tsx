import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/features/auth/auth-store";
import { USER_ROLES } from "@/features/auth/types";
import { useBranches } from "@/features/branches/hooks/use-branches";

interface BranchFilterProps {
    value: string;
    onValueChange: (value: string) => void;
    /** Label text shown above the selector (Admin) or next to the static badge (non-Admin). */
    label?: string;
    /** Placeholder text for "All Branches" option. */
    allLabel?: string;
    /** Additional className for the wrapper */
    className?: string;
    /** Trigger width class */
    triggerClassName?: string;
}

/**
 * Branch filter control that is role-aware:
 * - **Admin**: Shows a `<Select>` dropdown with all branches + an "All" option.
 * - **Non-Admin**: Shows a static badge/label with the user's own branch name.
 *   The value is automatically locked to the user's branch.
 */
export default function BranchFilter({
    value,
    onValueChange,
    allLabel = "All Branches",
    className,
    triggerClassName = "w-44 h-8 text-xs",
}: BranchFilterProps) {
    const user = useUser();
    const isAdmin = user?.role === USER_ROLES.Admin;
    const { data: branchesData } = useBranches();
    const branches = branchesData ?? [];

    // Non-Admin: show a static read-only badge
    if (!isAdmin) {
        const branchName =
            user?.employee?.branch?.displayName ?? "—";
        return (
            <div className={className}>
                <Badge variant="outline" className="h-8 px-3 text-xs font-normal">
                    {branchName}
                </Badge>
            </div>
        );
    }

    // Admin: full interactive dropdown
    return (
        <Select
            value={value}
            onValueChange={(v) => onValueChange(v === "all" ? "" : v)}
        >
            <SelectTrigger className={triggerClassName}>
                <SelectValue placeholder={allLabel} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{allLabel}</SelectItem>
                {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                        {b.displayName}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
