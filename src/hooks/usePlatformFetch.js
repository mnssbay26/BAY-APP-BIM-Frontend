import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setProjects,
    setBim360,
    setAcc,
} from "@/store/slices/projects/projectsSlice";
import { fetchBim360ProjectsData } from "@/pages/services/bim360.services";
import { fetchAccProjectsData } from "@/pages/services/acc.services";

// THIS DOES NOT YET FILTER OUT CONTENT
export default function usePlatformFetch(isAcc) {
    const dispatch = useDispatch();
    const projects = useSelector((store) => store.projects.projects);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetches Projects Data
    useEffect(() => {
        setLoading(true);
        const getProjects = async () => {
            try {
                const projectsData = isAcc
                    ? await fetchAccProjectsData()
                    : await fetchBim360ProjectsData();
                dispatch(setProjects(projectsData.projects));
                isAcc ? dispatch(setAcc()) : dispatch(setBim360());
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };
        getProjects();
    }, []);

    /*
    // Fetches Project Data
    useEffect(() => {
        const getProject = async () => {
            const projectData = await fetchBim360ProjectData(
                projectId,
                accountId
            );

            setProject(projectData);
        };
        getProject();
    }, [projectId, accountId]);
    */

    return { loading, projects, error };
}
