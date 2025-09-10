import React, { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";

import {
    fetchAccProjectsData,
    fetchAccProjectData,
} from "@/pages/services/acc.services";

import {
    fetchBim360ProjectsData,
    fetchBim360ProjectData,
} from "@/pages/services/bim360.services";

import { ProjectsDropdownMenu } from "@/components/platform_general_components/general_platform_components/platfomr.projects.dropdownmenu";

const BACKEND_BASE_URL = import.meta.env.VITE_API_BACKEND_BASE_URL;

const PlatformHeaderLeft = ({ projectId, accountId, isAcc }) => {
    // determines source of fetch
    let fetchProjectsData = fetchBim360ProjectsData;
    let fetchProjectData = fetchBim360ProjectData;
    if (isAcc) {
        fetchProjectsData = fetchAccProjectsData;
        fetchProjectData = fetchAccProjectData;
    }

    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState(null);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const containerRef = useRef(null);
    const [newproject, setNewProject] = useState(null);

    //Cookies
    const [cookies] = useCookies(["access_token"]);

    //Drop Down Menu
    const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
    const [selectedProjectName, setSelectedProjectName] = useState("");
    const [projectsData, setProjectsData] = useState(null);
    const [project, setProject] = useState(null);

    //ProjectsData
    useEffect(() => {
        const getProjects = async () => {
            const projectsData = await fetchProjectsData();

            setProjectsData(projectsData);
        };
        getProjects();
    }, []);

    useEffect(() => {
        // don't fetch unless you have both
        if (!projectId || !accountId) {
            return;
        }
        const getProject = async () => {
            console.log("Fetching project data of the following:");
            console.log(`ProjectId: ${projectId} | Account ID: ${accountId}`);
            const projectData = await fetchProjectData(projectId, accountId);

            setProject(projectData);
        };
        getProject();
    }, [projectId, accountId]);

    useEffect(() => {
        const getUserProfile = async () => {
            try {
                const response = await fetch(
                    `${BACKEND_BASE_URL}/general/user/profile`,
                    {
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    console.error("Error fetching user profile:");
                    setError("Error fetching user profile");
                    return;
                }

                const data = await response.json();

                console.debug("user profile data", data);
                setUserProfile(data.data.user.emailId);
            } catch (error) {
                setError(
                    error?.response?.data?.message ||
                        "Error fetching user profile"
                );
            }
        };
        getUserProfile();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        window.location.href = "/";
    };

    const handleGoPlatform = () => {
        navigate("/platform");
    };

    const handleGoAuth = () => {
        navigate("/login");
    };

    return (
        <div className="flex items-center space-x-4">
            <Link
                to="/"
                className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
                BAYER CROP SCIENCE BIM APP
            </Link>

            {/* Drop Down projects */}
            {projectsData?.projects?.length > 0 && (
                <ProjectsDropdownMenu
                    label={project?.name || "Select a project"}
                    options={projectsData.projects.map((proj) => ({
                        label: proj.attributes.name,
                        value: proj.id,
                    }))}
                    onSelect={(option) => {
                        navigate(
                            `/bim360/projects/${accountId}/${option.value}`
                        );
                    }}
                />
            )}
        </div>
    );
};
export default PlatformHeaderLeft;
