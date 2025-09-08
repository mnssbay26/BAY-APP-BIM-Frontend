export async function backendOnline(BACKEND_BASE_URL) {
    const result = await fetch(`${BACKEND_BASE_URL}`);
    if (result.status === 200) {
        return true;
    }
    return false;
}
