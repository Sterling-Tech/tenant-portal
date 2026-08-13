import { get, post, patch, del, put } from './api';
import { ConfigureVendorPayload } from './onbordingService';
import { Tenant } from './tenantService';

export interface CreateAdmin {
    id: string;
    name: string;
    email: string;
    gender: string;
    phone_number: string;
}
export interface UserProfile {
    id: number;
    name: string;
    gender: string;
    phone_number: string;
    email: string;
    is_2fa_enabled: boolean;
    two_fa_method: "email" | "authenticator";
    totp_confirmed: boolean;
    user_type: string;
}
export interface adminForm {
    name: string;
    email: string;
    gender: string;
    phone_number: string;
}

export interface Permission {
    id: number;
    name: string;
    description: string;
    code: string;
}

export interface GrantPermissionPayload {
    user: string;
    permissions: number[];
}
export interface PermissionItem {
    permission: {
        id: number;
        name: string;
        description: string;
        code: string;
    };
}
export interface ChangePasswordProp{
    old_password:string;
    new_password:string;
    confirm_password:string;
}
export interface UpdateUserForm{
    name:string;
    gender:string;
    phone_number:string;
    is_2fa_enabled:boolean;
}
export interface UpdateProfilePayload {
    name?: string;
    gender?: string;
    phone_number?: string;
    is_2fa_enabled?: boolean;
}
export const createNewAdmin = (data: adminForm) => {
    return post<CreateAdmin>('/user/admin/', data);
}
export const getAllAdmin = () => {
    return get<CreateAdmin[]>('/user/admin/');
}

export const getPermissions = () => {
    return get<PermissionItem[]>("/user/permissions/");
};
export const getSystemPermissions=()=>{
    return get<Permission[]>("/user/permissions/all/")
}
// export const getUserPermissions = (userId: string) => {
//     return get<PermissionItem[]>("/user/" + userId + "/permissions/");
// }
// export const getUserPermission = (userId: string) => {
//     return get<PermissionItem[]>("/user/permissions/" + userId );
// }
export const grantPermissions = (
    data: GrantPermissionPayload
) => {
    return post("/user/grant-permission/", data);
};

export const changePassword=(data:ChangePasswordProp)=>{
    return put("/user/change-password/", data)
}

export const updateUser=(data:UpdateUserForm)=>{
    return put<UserProfile>("/user/update-profile/", data)
}
export const updateProfile = (data: UpdateProfilePayload) =>
    put<UserProfile>('/user/update-profile/', data);


export const configureVendor = async (
    payload: ConfigureVendorPayload,
    vendor_id: string | number
) => {
    return put(
        `/vendor/configure/?vendor_id=${vendor_id}`,
        payload
    );
};

// ═════════════════════════════════════════════════════════════════════════
// TOTP (AUTHENTICATOR APP) 2FA
// ═════════════════════════════════════════════════════════════════════════

export interface TotpSetupResponse {
    secret: string;
    otpauth_uri: string;
    qr_code: string;
}

export interface TotpConfirmPayload {
    otp: string;
}

export interface TotpUserProfile {
    id: number;
    name: string;
    gender: string;
    phone_number: string;
    email: string;
    is_2fa_enabled: boolean;
    two_fa_method: 'email' | 'authenticator';
    totp_confirmed: boolean;
    group?: { id: number; name: string; description: string; created_at: string } | null;
    user_type: string;
    [key: string]: any;
}

export const setupTotp = () =>
    post<TotpSetupResponse>('/user/2fa/totp/setup/', {});

export const confirmTotp = (data: TotpConfirmPayload) =>
    post<TotpUserProfile>('/user/2fa/totp/confirm/', data);

export const disableTotp = () =>
    post<TotpUserProfile>('/user/2fa/totp/disable/', {});

// ═════════════════════════════════════════════════════════════════════════
// TOTP LOGIN VERIFICATION  (called from TotpLoginVerify page)
// ═════════════════════════════════════════════════════════════════════════

export interface TotpLoginPayload {
    email: string;
    otp: string;
}

/** POST /user/login/confirm-totp/ — verify TOTP code during login */
export const verifyTotpLogin = (data: TotpLoginPayload) =>
    post<any>('/user/login/confirm-totp/', data);
