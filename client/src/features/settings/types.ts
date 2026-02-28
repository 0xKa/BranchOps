export interface AccountProfile {
    id: string;
    username: string;
    email: string | null;
    role: string;
    fullName: string | null;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileRequest {
    username?: string;
    email?: string;
    fullName?: string;
    phone?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
