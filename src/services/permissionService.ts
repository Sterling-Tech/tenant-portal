// permissionService.ts

import { User } from "../store/slices/authSlice";
import { getUserPermissions, viewGroup } from "./roleService";

export const loadPermissions = async (user: User) => {
    const [group, direct] = await Promise.all([
        user.group
            ? viewGroup(user.group.id)
            : Promise.resolve(null),

        getUserPermissions(Number(user.id)),
    ]);

    const combined = [
        ...(group?.permissions.map(
            p => p.permission.code
        ) ?? []),

        ...direct.map(
            p => p.permission.code
        ),
    ];

    const deduped = combined.filter((p, i) => combined.indexOf(p) === i);

    return deduped;
};