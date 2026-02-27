import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface CancelOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isPending: boolean;
    onConfirm: (reason: string) => void;
}

export default function CancelOrderDialog({
    open,
    onOpenChange,
    isPending,
    onConfirm,
}: CancelOrderDialogProps) {
    const [reason, setReason] = useState("");

    const handleOpenChange = (open: boolean) => {
        if (!open) setReason("");
        onOpenChange(open);
    };

    return (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to cancel this order? This action
                        cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-1">
                    <Label className="text-sm">Reason (optional)</Label>
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason for cancellation..."
                        className="min-h-16"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => onConfirm(reason)}
                        disabled={isPending}
                    >
                        {isPending ? "Cancelling…" : "Cancel Order"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
