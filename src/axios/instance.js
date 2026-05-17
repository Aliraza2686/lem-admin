import api from "../api";

/**
 * API wrapper instance
 */
export const instance = async ({
    url,
    method = "GET",
    data = {},
    params = {},
    headers = {},
}) => {
    try {
        const response = await api.request({
            url,
            method,
            data,
            params,
            headers,
        });

        return {
            success: true,
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        const status = error?.response?.status;

        const message =
            error?.response?.data?.message ||
            error.message ||
            "Something went wrong";

        // 🔥 GLOBAL 401 HANDLING
        if (status === 401) {
            await handleLogout(); // safe internal logout
        }

        return {
            success: false,
            status,
            message,
            error: error?.response?.data || null,
        };
    }
};

/**
 * SAFE logout function
 * IMPORTANT:
 * - DO NOT use instance() here (avoids infinite loop)
 * - Use raw api instead
 */
export const handleLogout = async () => {
    try {
        // optional backend logout call
        await api.post("/users/logout").catch(() => {
            // ignore errors (token may already be expired)
        });

        // clear client storage
        localStorage.clear();
        sessionStorage.clear();

        // clear cookies safely
        document.cookie.split(";").forEach((cookie) => {
            document.cookie = cookie
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
        });

        // redirect to login
        window.location.replace("/");
    } catch (err) {
        // fallback cleanup
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace("/");
    }
};