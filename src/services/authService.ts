// services/authService.ts

const AUTH_URL = "http://188.166.161.13:8061";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface OtpPayload {
    email: string;
    otp: string;
}

async function parseResponse(response: Response) {
    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
        throw new Error("Invalid server response");
    }

    return response.json();
}

export const loginUser = async (payload: LoginPayload) => {
    const response = await fetch(`${AUTH_URL}/user/login/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);

    return {
        ok: response.ok,
        status: response.status,
        data,
    };
};

export const confirmOtp = async (payload: OtpPayload) => {
    const response = await fetch(`${AUTH_URL}/user/login/confirm-otp/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);

    return {
        ok: response.ok,
        status: response.status,
        data,
    };
};