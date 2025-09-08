import { useState, useRef, useEffect } from "react";

export const useHideOnOutsideClick = () => {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const hideOnOutsideClick = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setIsVisible(false);
            }
        };
        document.addEventListener("mousedown", hideOnOutsideClick);
        return () => {
            document.removeEventListener("mousedown", hideOnOutsideClick);
        };
    }, []);

    const show = () => setIsVisible(true);
    const hide = () => setIsVisible(false);
    const toggle = () => setIsVisible((prev) => !prev);

    return { containerRef, isVisible, show, hide, toggle };
};
