import { useAppSelector } from "../store/hooks";

export const usePermission = () => {
    const permissions = useAppSelector(
        state => state.permissions.permissions
    );

    const can = (permission: string) =>
        permissions.includes(permission);

    return { can };
};