import { useState, useEffect, useCallback } from "react";

const BACKEND_BASE_URL = import.meta.env.VITE_API_BACKEND_BASE_URL;

/**
 * Custom hook for fetching user profile data
 * @param {boolean} autoFetch - Whether to fetch the profile automatically on mount
 * @returns {Object} User profile state and functions
 */
const useUserProfile = (autoFetch = true) => {
    const [userProfile, setUserProfile] = useState(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getUserProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${BACKEND_BASE_URL}/general/user/profile`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorMessage = `Error fetching user profile: ${response.status}`;
                console.error(errorMessage);
                setError(errorMessage);
                setIsLoading(false);
                return null;
            }

            const data = await response.json();
            const emailId = data.data?.user?.emailId;
            setUserProfile(emailId);
            setIsLoading(false);
            return emailId;
        } catch (error) {
            const errorMessage =
                error?.response?.data?.message || "Error fetching user profile";
            setError(errorMessage);
            setIsLoading(false);
            return null;
        }
    }, []);

    const clearUserProfile = useCallback(async () => {
        setUserProfile(undefined);
    }, []);

    // Automatically refresh profile when the hook is mounted if autoFetch is true
    useEffect(() => {
        if (autoFetch) {
            getUserProfile();
        }
    }, [autoFetch, getUserProfile]);

    return {
        userProfile,
        isLoading,
        error,
        getUserProfile,
        clearUserProfile,
    };
};

export { useUserProfile };
