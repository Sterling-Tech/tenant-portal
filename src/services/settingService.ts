import { get, post, patch, del, put } from './api';
import { Tenant } from './tenantService';

export interface CreateAdmin {
    id: string;
    name: string;
    email: string;
    gender: string;
    phone_number: string;
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
export const createNewAdmin = (data: adminForm) => {
    return post<CreateAdmin>('/user/admin/', data);
}
export const getAllAdmin = () => {
    return get<CreateAdmin[]>('/user/admin/');
}

export const getPermissions = () => {
    return get<PermissionItem[]>("/user/permissions/");
};
export const getUserPermissions = (userId: string) => {
    return get<PermissionItem[]>("/user/" + userId + "/permissions/");
}
export const getUserPermission = (userId: string) => {
    return get<PermissionItem[]>("/user/permissions/" + userId );
}
export const grantPermissions = (
    data: GrantPermissionPayload
) => {
    return post("/user/grant-permission/", data);
};

export const changePassword=(data:ChangePasswordProp)=>{
    return put("/user/change-password/",data)
}

