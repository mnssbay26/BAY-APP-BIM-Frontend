import usePlatformFetch from "./usePlatformFetch";

export default function useBimFetch() {
    const { loading, projects, error } = usePlatformFetch(false);
    return { loading, projects, error };
}
