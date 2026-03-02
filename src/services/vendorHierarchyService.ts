import { get, post, patch, del } from './api';
import {
    VendorOrg,
    VendorOrgForm,
    VendorRoleBinding,
    BindingForm,
    WalletSummary,
    WalletTransferPayload,
    WalletTransferResponse,
    ApiKey,
    ApiKeyWithSecret,
    ApiKeyAuditEntry,
    TenantAdminProfile,
} from '../types/vendor';

const buildTenantQuery = (tenantId?: string | null) => (tenantId ? `?tenant_id=${tenantId}` : '');

export const fetchTenantAdminProfiles = (tenantId?: string | null) =>
    get<TenantAdminProfile[]>(`/tenants/admin-profiles/${buildTenantQuery(tenantId)}`);

export const fetchVendorOrgTree = (tenantId?: string | null) =>
    get<VendorOrg[]>(`/tenants/vendor-orgs/tree/${buildTenantQuery(tenantId)}`);

export const createVendorOrg = (payload: VendorOrgForm & { tenant: string }) =>
    post<VendorOrg>('/tenants/vendor-orgs/', payload);

export const updateVendorOrg = (id: string, payload: Partial<VendorOrgForm>) =>
    patch<VendorOrg>(`/tenants/vendor-orgs/${id}/`, payload);

export const deleteVendorOrg = (id: string) =>
    del<void>(`/tenants/vendor-orgs/${id}/`);

export const fetchOrgBindings = (orgId: string) =>
    get<VendorRoleBinding[]>(`/tenants/vendor-orgs/${orgId}/bindings/`);

export const addOrgBinding = (orgId: string, payload: BindingForm) => {
    console.log('[vendorHierarchyService] Adding org binding:', { orgId, payload });
    return post<VendorRoleBinding>(`/tenants/vendor-orgs/${orgId}/add_binding/`, payload);
};

export const updateBindingStatus = (bindingId: string, payload: Partial<BindingForm>) =>
    patch<VendorRoleBinding>(`/tenants/vendor-bindings/${bindingId}/`, payload);

export const deleteBinding = (bindingId: string) =>
    del<void>(`/tenants/vendor-bindings/${bindingId}/`);

export const fetchOrgWallets = (orgId: string) =>
    get<WalletSummary[]>(`/wallets/api/vendor-wallets/?owner_type=vendor_org&owner_id=${orgId}`);

export const fetchUserWallets = (userId: string) =>
    get<WalletSummary[]>(`/wallets/api/vendor-wallets/?owner_type=user&owner_id=${userId}`);

export const transferBetweenWallets = (walletId: string, payload: WalletTransferPayload) =>
    post<WalletTransferResponse>(`/wallets/api/vendor-wallets/${walletId}/transfer/`, payload);

export const fetchApiKeys = (ownerType: 'vendor_org' | 'user', ownerId: string) =>
    get<ApiKey[]>(`/core/api-keys/?owner_type=${ownerType}&owner_id=${ownerId}`);

export const issueApiKey = (payload: { owner_type: 'vendor_org' | 'user'; owner_id: string; scopes?: string[]; expires_at?: string | null }) =>
    post<ApiKeyWithSecret>('/core/api-keys/', payload);

export const rotateApiKey = (id: string) =>
    post<ApiKeyWithSecret>(`/core/api-keys/${id}/rotate/`, {});

export const revokeApiKey = (id: string) =>
    post<ApiKey>(`/core/api-keys/${id}/revoke/`, {});

export const deleteApiKey = (id: string) =>
    del<void>(`/core/api-keys/${id}/`);

export const fetchApiKeyAudit = (id: string) =>
    get<ApiKeyAuditEntry[]>(`/core/api-keys/${id}/audit/`);

export const bootstrapUserApiKey = () =>
    post<ApiKeyWithSecret>('/core/api-keys/bootstrap/', {});

