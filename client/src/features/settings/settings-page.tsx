import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import ProfilePicture from "@/components/shared/ProfilePicture";
import PageContainer, { PageHeader } from "@/layouts/page-container";
import { KeyRound, Mail, Phone, User } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useAccountProfile,
    useUpdateProfile,
    useChangePassword,
} from "./hooks";


const profileSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(50),
    email: z.string().email("Invalid email").or(z.literal("")).optional(),
    fullName: z.string().max(200).optional(),
    phone: z.string().max(20).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "Must be at least 6 characters"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type PasswordFormValues = z.infer<typeof passwordSchema>;

// ── Page ──

export default function SettingsPage() {
    const { data: profile, isLoading } = useAccountProfile();
    const updateProfile = useUpdateProfile();
    const changePassword = useChangePassword();

    // Profile form
    const {
        register: profileReg,
        handleSubmit: handleProfileSubmit,
        reset: resetProfile,
        formState: { errors: profileErrors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { username: "", email: "", fullName: "", phone: "" },
    });

    // Password form
    const {
        register: passwordReg,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors },
    } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    // Sync profile data into the form when it loads
    useEffect(() => {
        if (profile) {
            resetProfile({
                username: profile.username,
                email: profile.email ?? "",
                fullName: profile.fullName ?? "",
                phone: profile.phone ?? "",
            });
        }
    }, [profile, resetProfile]);

    const onProfileSubmit = (data: ProfileFormValues) => {
        updateProfile.mutate({
            username: data.username || undefined,
            email: data.email || undefined,
            fullName: data.fullName || undefined,
            phone: data.phone || undefined,
        });
    };

    const onPasswordSubmit = (data: PasswordFormValues) => {
        changePassword.mutate(
            { currentPassword: data.currentPassword, newPassword: data.newPassword },
            { onSuccess: () => resetPassword() },
        );
    };

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            </PageContainer>
        );
    }

    const displayName = profile?.fullName || profile?.username || "User";
    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
        })
        : "";

    return (
        <PageContainer>
            <PageHeader
                title="Account Settings"
                description="Manage your profile and security settings"
            />

            <div className="flex flex-col gap-6">
                {/* ── Top row: Profile overview + Profile info ── */}
                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    {/* Profile overview */}
                    <Card className="surface-1 h-full border-border/60 shadow-glow-subtle flex items-center justify-center">
                        <CardContent className="flex flex-col items-center justify-center gap-4 ">
                            <ProfilePicture fullName={displayName} size={20} />
                            <div className="text-center">
                                <p className="text-base font-semibold">{displayName}</p>
                                {profile?.email && (
                                    <p className="text-sm text-muted-foreground">
                                        {profile.email}
                                    </p>
                                )}
                            </div>
                            <Badge variant="secondary" className="text-sm">{profile?.role}</Badge>
                            {memberSince && (
                                <p className="text-xs text-muted-foreground">
                                    System user since {memberSince}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Profile information form */}
                    <Card className="surface-1 border-border/60 shadow-glow-subtle">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="size-4 text-muted-foreground" />
                                Profile Information
                            </CardTitle>
                            <CardDescription>
                                Update your account details and personal information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                id="profile-form"
                                onSubmit={handleProfileSubmit(onProfileSubmit)}
                                className="grid gap-4 sm:grid-cols-2"
                            >
                                <div className="space-y-1">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="Your username"
                                        {...profileReg("username")}
                                    />
                                    {profileErrors.username && (
                                        <p className="text-xs text-destructive">
                                            {profileErrors.username.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="email">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Mail className="size-3 text-muted-foreground" />
                                            Email
                                        </span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        {...profileReg("email")}
                                    />
                                    {profileErrors.email && (
                                        <p className="text-xs text-destructive">
                                            {profileErrors.email.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input
                                        id="fullName"
                                        placeholder="Your full name"
                                        {...profileReg("fullName")}
                                    />
                                    {profileErrors.fullName && (
                                        <p className="text-xs text-destructive">
                                            {profileErrors.fullName.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="phone">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Phone className="size-3 text-muted-foreground" />
                                            Phone
                                        </span>
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+968 1234 5678"
                                        {...profileReg("phone")}
                                    />
                                    {profileErrors.phone && (
                                        <p className="text-xs text-destructive">
                                            {profileErrors.phone.message}
                                        </p>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                        <Separator className="bg-border/70" />
                        <CardFooter className="justify-end pt-1">
                            <Button
                                type="submit"
                                form="profile-form"
                                className="neon-glow"
                                disabled={updateProfile.isPending}
                            >
                                {updateProfile.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* ── Bottom row: Change password ── */}
                <Card className="surface-1 border-border/60 shadow-glow-subtle">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <KeyRound className="size-4 text-muted-foreground" />
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Update your password to keep your account secure.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            id="password-form"
                            onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                            className="grid gap-4 sm:grid-cols-3"
                        >
                            <div className="space-y-1">
                                <Label htmlFor="currentPassword">Current Password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...passwordReg("currentPassword")}
                                />
                                {passwordErrors.currentPassword && (
                                    <p className="text-xs text-destructive">
                                        {passwordErrors.currentPassword.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...passwordReg("newPassword")}
                                />
                                {passwordErrors.newPassword && (
                                    <p className="text-xs text-destructive">
                                        {passwordErrors.newPassword.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...passwordReg("confirmPassword")}
                                />
                                {passwordErrors.confirmPassword && (
                                    <p className="text-xs text-destructive">
                                        {passwordErrors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                    <Separator className="bg-border/70" />
                    <CardFooter className="justify-end pt-1">
                        <Button
                            type="submit"
                            form="password-form"
                            className="neon-glow"
                            disabled={changePassword.isPending}
                        >
                            {changePassword.isPending ? "Changing..." : "Change Password"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </PageContainer>
    );
}
