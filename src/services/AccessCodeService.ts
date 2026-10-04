import { get, post, patch, del, put } from './api';

export interface Guard {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    gender: "male" | "female";
    account_active: boolean;
    date_joined: string;
}

export interface CreateGuardPayload {
    name: string;
    email: string;
    phone_number: string;
    gender: "male" | "female";
}

export interface ActivateDeactivateGuard {
    id: number;
    account_active: boolean;
}

export interface AccessCodePayload {
    code: string;
}

export interface Host {
    name: string;
    phone_number: string;
    address: string;
}

export interface AccessCodeResponse {
    code: string;
    visitor_name: string;
    visitor_phone: string;
    expires_at: string;
    used_at: string | null;
    host: Host;
}

export const getGuards = () => {
    return get<Guard[]>("/access/guards/");
};

export const createGuard = (
    payload: CreateGuardPayload
) => {
    return post<Guard>(
        "/access/guards/",
        payload
    );
};

export const activateDeactivateGuard = (
    payload: ActivateDeactivateGuard
) => {
    return put<Guard>(
        "/access/guards/status/",
        payload
    );
};

export const verifyAccessCode = (
    payload: AccessCodePayload
) => {
    return post<AccessCodeResponse>(
        "/access/gate/verify/",
        payload
    );
};

export const admitVisitor = (
    payload: AccessCodePayload
) => {
    return post<AccessCodeResponse>(
        "/access/gate/admit/",
        payload
    );
};