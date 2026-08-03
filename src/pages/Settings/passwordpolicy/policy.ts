import { get, post, patch, del, put } from '../../../services/api';

export interface Policy {
    is_enabled: boolean;
    min_length: number;
    require_upper: boolean;
    require_lower: boolean;
    require_number: boolean;
    require_symbol: boolean;
    block_common_passwords: boolean;
    check_hibp_online: boolean;
    history_depth: number;
    max_failed_attempts: number;
    lockout_minutes: number;
    attempt_window_minutes: number;
    password_expiry_days: number;
    updated_at: string;

}

export const retrievePolicy = () => {
  return get<Policy>("/user/password-policy/");
};

export const updatePolicy = (payload: Policy) => {
  return put<Policy>("/user/password-policy/", payload);
};
