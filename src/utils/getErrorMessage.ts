
export const getErrorMessage = (error: any): string => {
    if (!navigator.onLine) {
        return "You're offline. Please check your internet connection.";
    }

    // unwrap ApiErrors
    let data = error?.data || error?.response?.data || error?.error || error;

    if (!data) {
        return "An unexpected error occurred.";
    }

    if (typeof data === "string") {
        return data;
    }

    // validation errors first
    for (const key of Object.keys(data)) {
        const value = data[key];

        if (Array.isArray(value) && value.length) {
            return value[0];
        }

        if (typeof value === "string") {
            return value;
        }
    }

    if (data.detail) {
        return data.detail;
    }

    if (data.message) {
        return data.message;
    }

    return error?.message || "An unexpected error occurred.";
};


