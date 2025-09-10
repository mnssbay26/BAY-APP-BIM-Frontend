const initiateLogin = () => {
    const CLIENT_ID = import.meta.env.VITE_API_CLIENT_ID;
    const BACKEND_BASE_URL = import.meta.env.VITE_API_BACKEND_BASE_URL;

    if (!CLIENT_ID) {
        console.error("Missing VITE_API_CLIENT_ID environment variable");
        return;
    }

    const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        redirect_uri: `${BACKEND_BASE_URL}/auth/three-legged`,
        scope: "data:read data:write data:create account:read",
    });

    const redirect = `https://developer.api.autodesk.com/authentication/v2/authorize?${params.toString()}`;
    window.location.href = redirect;
};

export { initiateLogin };
