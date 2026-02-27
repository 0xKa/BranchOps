import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useBranches } from "@/features/branches/hooks";
import { useProducts } from "@/features/products/hooks";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import {
    Minus,
    Plus,
    Search,
    ShoppingCart,
    Trash2,
    X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { usePlaceOrder } from "./hooks";
import {
    PAYMENT_METHOD,
    PAYMENT_METHOD_LABELS,
    type CartItem,
    type PaymentMethod,
} from "./types";

export default function NewOrderPage() {
    const { data: branchesData } = useBranches();
    const placeMutation = usePlaceOrder();

    const [branchId, setBranchId] = useState("");
    const [search, setSearch] = useState("");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discount, setDiscount] = useState(0);
    const [tax, setTax] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
        PAYMENT_METHOD.Cash,
    );
    const [amountPaid, setAmountPaid] = useState(0);
    const [notes, setNotes] = useState("");

    const { data: productsData, isLoading: productsLoading } = useProducts({
        pageSize: 100,
        search,
        isActive: true,
    });

    const products = productsData?.items ?? [];
    const branches = branchesData?.filter((b) => b.isActive) ?? [];

    const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);
    const total = subtotal - discount + tax;

    const addToCart = useCallback(
        (product: { id: string; name: string; price: number }) => {
            setCart((prev) => {
                const existing = prev.find(
                    (item) => item.productId === product.id,
                );
                if (existing) {
                    return prev.map((item) =>
                        item.productId === product.id
                            ? {
                                ...item,
                                quantity: item.quantity + 1,
                                lineTotal:
                                    (item.quantity + 1) * item.unitPrice,
                            }
                            : item,
                    );
                }
                return [
                    ...prev,
                    {
                        productId: product.id,
                        productName: product.name,
                        unitPrice: product.price,
                        quantity: 1,
                        lineTotal: product.price,
                    },
                ];
            });
        },
        [],
    );

    const updateQuantity = useCallback(
        (productId: string, quantity: number) => {
            if (quantity <= 0) {
                setCart((prev) =>
                    prev.filter((item) => item.productId !== productId),
                );
                return;
            }
            setCart((prev) =>
                prev.map((item) =>
                    item.productId === productId
                        ? {
                            ...item,
                            quantity,
                            lineTotal: quantity * item.unitPrice,
                        }
                        : item,
                ),
            );
        },
        [],
    );

    const removeFromCart = useCallback((productId: string) => {
        setCart((prev) =>
            prev.filter((item) => item.productId !== productId),
        );
    }, []);

    const clearCart = () => {
        setCart([]);
        setDiscount(0);
        setTax(0);
        setAmountPaid(0);
        setNotes("");
    };

    const handlePlaceOrder = () => {
        if (!branchId || cart.length === 0) return;

        placeMutation.mutate(
            {
                branchId,
                items: cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
                discount,
                tax,
                paymentMethod,
                amountPaid,
                notes: notes || null,
            },
            {
                onSuccess: () => clearCart(),
            },
        );
    };

    return (
        <PageContainer>
            <PageHeader
                title="New Order"
                description="Create a new POS order"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left: Product Selection */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Branch Selection */}
                    <div className="space-y-1">
                        <Label>Branch</Label>
                        <Select
                            value={branchId}
                            onValueChange={setBranchId}
                        >
                            <SelectTrigger className="w-full max-w-xs">
                                <SelectValue placeholder="Select a branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {branches.map((branch) => (
                                    <SelectItem
                                        key={branch.id}
                                        value={branch.id}
                                    >
                                        {branch.displayName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Product Search */}
                    <div className="relative max-w-sm">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="ps-9"
                        />
                    </div>

                    {/* Product Grid */}
                    {productsLoading ? (
                        <div className="flex justify-center py-12">
                            <Spinner className="size-6" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() =>
                                            addToCart({
                                                id: product.id,
                                                name: product.name,
                                                price: product.price,
                                            })
                                        }
                                        className="rounded-lg border bg-card p-3 text-start hover:bg-accent transition-colors cursor-pointer"
                                    >
                                        <p className="font-medium text-sm truncate">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {product.categoryName}
                                        </p>
                                        <p className="text-sm font-semibold mt-2">
                                            {product.price.toFixed(3)}
                                        </p>
                                    </button>
                                ))
                            ) : (
                                <p className="col-span-full text-center text-muted-foreground py-8">
                                    No products found.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Cart & Checkout */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <ShoppingCart className="size-4" />
                                    Cart
                                    {cart.length > 0 && (
                                        <Badge variant="secondary">
                                            {cart.reduce(
                                                (sum, i) => sum + i.quantity,
                                                0,
                                            )}
                                        </Badge>
                                    )}
                                </span>
                                {cart.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={clearCart}
                                        title="Clear cart"
                                    >
                                        <X className="size-4" />
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {cart.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Cart is empty
                                </p>
                            ) : (
                                <>
                                    {cart.map((item) => (
                                        <div
                                            key={item.productId}
                                            className="flex items-center justify-between gap-2"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {item.productName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.unitPrice.toFixed(3)}{" "}
                                                    × {item.quantity} ={" "}
                                                    {item.lineTotal.toFixed(3)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-7"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                >
                                                    <Minus className="size-3" />
                                                </Button>
                                                <span className="text-sm w-6 text-center">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-7"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="size-3" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-destructive"
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.productId,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="size-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <Separator />

                                    {/* Discount & Tax */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Discount
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                min="0"
                                                value={discount}
                                                onChange={(e) =>
                                                    setDiscount(
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">
                                                Tax
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                min="0"
                                                value={tax}
                                                onChange={(e) =>
                                                    setTax(
                                                        Number(e.target.value),
                                                    )
                                                }
                                                className="h-8 text-xs"
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-1">
                                        <Label className="text-xs">
                                            Payment Method
                                        </Label>
                                        <Select
                                            value={String(paymentMethod)}
                                            onValueChange={(v) =>
                                                setPaymentMethod(
                                                    Number(v) as PaymentMethod,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(
                                                    PAYMENT_METHOD,
                                                ).map(([_label, value]) => (
                                                    <SelectItem
                                                        key={value}
                                                        value={String(value)}
                                                    >
                                                        {
                                                            PAYMENT_METHOD_LABELS[
                                                            value
                                                            ]
                                                        }
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Amount Paid */}
                                    <div className="space-y-1">
                                        <Label className="text-xs">
                                            Amount Paid
                                        </Label>
                                        <Input
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            value={amountPaid}
                                            onChange={(e) =>
                                                setAmountPaid(
                                                    Number(e.target.value),
                                                )
                                            }
                                            className="h-8 text-xs"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div className="space-y-1">
                                        <Label className="text-xs">
                                            Notes
                                        </Label>
                                        <Textarea
                                            value={notes}
                                            onChange={(e) =>
                                                setNotes(e.target.value)
                                            }
                                            placeholder="Optional notes..."
                                            className="min-h-12 text-xs"
                                        />
                                    </div>

                                    <Separator />

                                    {/* Totals */}
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                                Subtotal
                                            </span>
                                            <span>
                                                {subtotal.toFixed(3)}
                                            </span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Discount
                                                </span>
                                                <span className="text-destructive">
                                                    -{discount.toFixed(3)}
                                                </span>
                                            </div>
                                        )}
                                        {tax > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Tax
                                                </span>
                                                <span>
                                                    +{tax.toFixed(3)}
                                                </span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex justify-between font-bold text-base">
                                            <span>Total</span>
                                            <span>{total.toFixed(3)}</span>
                                        </div>
                                        {amountPaid > 0 &&
                                            amountPaid > total && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>Change</span>
                                                    <span>
                                                        {(
                                                            amountPaid - total
                                                        ).toFixed(3)}
                                                    </span>
                                                </div>
                                            )}
                                    </div>

                                    <Button
                                        className="w-full"
                                        size="lg"
                                        disabled={
                                            !branchId ||
                                            cart.length === 0 ||
                                            placeMutation.isPending
                                        }
                                        onClick={handlePlaceOrder}
                                    >
                                        {placeMutation.isPending
                                            ? "Placing Order..."
                                            : "Place Order"}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
}
