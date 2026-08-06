import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { clearApiKeyCredentials } from '../../utils/apiKeyStorage';

export interface UserGroup {
    id: number;
    name: string;
    description: string;
    created_at: string;
}

export interface User {
    id: string;
    email: string;
    password?:string;
    username?:string;
    name?: string;
    phone?:string;
    user_type?:string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    role?: string;
    gender:string;
    is_superuser?: boolean;
    isSuperuser?: boolean;
    is_staff?: boolean;
    isStaff?: boolean;
    is_2fa_enabled: boolean,
    two_fa_method: "email" | "authenticator";
    totp_confirmed: boolean;
    group: UserGroup | null;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
};

const extractAuthPayload = (data: any) => {
    const payload = data?.data ?? data ?? {};
    const token =
        payload.access ??
        payload.token ??
        payload.access_token ??
        payload.accessToken ??
        null;
    const refreshToken =
        payload.refresh ??
        payload.refresh_token ??
        payload.refreshToken ??
        null;
    const user = Object.prototype.hasOwnProperty.call(payload, 'user') ? payload.user : undefined;

    return { token, refreshToken, user };
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action: PayloadAction<{ user?: User | null; token?: string | null; refreshToken?: string | null }>) => {
            const { user, token, refreshToken } = action.payload;
            if (user !== undefined) {
                state.user = user;
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                } else {
                    localStorage.removeItem('user');
                }
            }
            if (token !== undefined) {
                state.token = token;
                if (token) {
                    localStorage.setItem('token', token);
                } else {
                    localStorage.removeItem('token');
                }
            }
            if (refreshToken !== undefined) {
                state.refreshToken = refreshToken;
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                } else {
                    localStorage.removeItem('refreshToken');
                }
            }
            state.isAuthenticated = Boolean(state.token);
        },
        logoutUser: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tenantId');
            localStorage.removeItem('currentTenant');
            localStorage.removeItem('currentTenantId');
            clearApiKeyCredentials();
        },
        setTokens: (state, action: PayloadAction<{ token?: string | null; refreshToken?: string | null }>) => {
            const { token, refreshToken } = action.payload;
            if (token !== undefined) {
                state.token = token;
                if (token) {
                    localStorage.setItem('token', token);
                } else {
                    localStorage.removeItem('token');
                }
            }
            if (refreshToken !== undefined) {
                state.refreshToken = refreshToken;
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                } else {
                    localStorage.removeItem('refreshToken');
                }
            }
            state.isAuthenticated = Boolean(state.token);
        },
    },
});

export const { setAuth, logoutUser, setTokens } = authSlice.actions;
export { extractAuthPayload };
export default authSlice.reducer;

