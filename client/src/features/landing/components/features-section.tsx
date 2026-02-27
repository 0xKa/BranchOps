import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import {
    GitBranch,
    ShoppingCart,
    Package,
    BarChart3,
} from "lucide-react";

const featureIcons = [GitBranch, ShoppingCart, Package, BarChart3];

export function FeaturesSection() {
    const { t } = useTranslation();

    const features = (
        t("landing.features", { returnObjects: true }) as {
            title: string;
            description: string;
        }[]
    ).map((feature, i) => ({
        ...feature,
        icon: featureIcons[i],
    }));

    return (
        <section className="border-t bg-muted/40">
            <div className="mx-auto max-w-5xl px-4 py-16">
                <h2 className="mb-8 text-center text-lg font-semibold">
                    {t("landing.featuresHeading")}
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                    {features.map(({ title, description, icon: Icon }) => (
                        <Card key={title} size="sm">
                            <CardHeader>
                                <div className="mb-1 flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <Icon className="size-4" />
                                </div>
                                <CardTitle>{title}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
