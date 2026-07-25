
export const getErrorMessage = (error: any): string => {
    // Browser is offline
    if (!navigator.onLine) {
        return "You're offline. Please check your internet connection and try again.";
    }

    // Network error (request never reached the server)
    if (
        error?.name === "TypeError" ||
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError")
    ) {
        return "Unable to connect to the server. Please check your internet connection.";
    }

    // Axios
    let data = error?.response?.data;

    // Your custom API wrapper
    if (!data) {
        data = error?.error;
    }

    // Direct object
    if (!data) {
        data = error;
    }

    if (!data) {
        return "An unexpected error occurred.";
    }

    if (typeof data === "string") {
        return data;
    }

    if (data.message) {
        return data.message;
    }

    if (data.detail) {
        return data.detail;
    }

    if (
        Array.isArray(data.non_field_errors) &&
        data.non_field_errors.length
    ) {
        return data.non_field_errors[0];
    }

    for (const key of Object.keys(data)) {
        const value = data[key];

        if (Array.isArray(value) && value.length) {
            return value[0];
        }

        if (typeof value === "string") {
            return value;
        }
    }

    return "An unexpected error occurred.";
};


