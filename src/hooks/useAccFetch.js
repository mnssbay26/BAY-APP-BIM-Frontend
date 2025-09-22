import usePlatformFetch from "./usePlatformFetch";
export default function useAccFetch() {
    const { loading, projects, error } = usePlatformFetch(true);
    return { loading, projects, error };
}
