import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PermissionState {
    permissions: string[];
    loading: boolean;
}

// const initialState: PermissionState = {
//     permissions: [],
//     loading: false,
// };

const initialState: PermissionState = {
    permissions: JSON.parse(
        localStorage.getItem("permissions") || "[]"
    ),
    loading: false,
};

const permissionSlice = createSlice({
    name: "permissions",
    initialState,
    reducers: {
        setPermissions(
            state,
            action: PayloadAction<string[]>
        ) {
            state.permissions = action.payload;
            state.loading = false;
        },

        clearPermissions(state) {
            state.permissions = [];
            state.loading = false;
        },

        setPermissionLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
    },
});

export const {
    setPermissions,
    clearPermissions,
    setPermissionLoading,
} = permissionSlice.actions;

export default permissionSlice.reducer;