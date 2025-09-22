import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ProjectsDropdownMenu } from "@/components/platform_general_components/general_platform_components/platfomr.projects.dropdownmenu";

import usePlatformFetch from "@/hooks/usePlatformFetch";
import { useHideOnOutsideClick } from "@/hooks/useHideOnOutsideClick";

const PlatformHeaderLeft = ({ projectId, accountId, isAcc }) => {
    const navigate = useNavigate();
    const { loading, projects, error: platformError } = usePlatformFetch(isAcc);
    // const { userProfile, isLoading, error: sessionError } = useUserSession();
    const { containerRef } = useHideOnOutsideClick();

    /*
    useEffect(() => {
        // don't fetch unless you have both
        if (!projectId || !accountId) {
            return;
        }
        const getProject = async () => {
            const projectData = await fetchProjectData(projectId, accountId);

            setProject(projectData);
        };
        getProject();
    }, [projectId, accountId]);
    */

    return (
        <div
            className="flex items-center space-x-4 platform-header-left"
            data-testid="platform-header-left"
        >
            <Link
                to="/"
                className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
                BAYER CROP SCIENCE BIM APP
            </Link>

            {/* Drop Down projects */}
            {projects && projects.length > 0 && (
                <ProjectsDropdownMenu
                    ref={containerRef}
                    label={"Select a project"}
                    options={projects.map((proj) => ({
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
