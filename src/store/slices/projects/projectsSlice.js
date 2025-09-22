import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
    if (window.__PLAYWRIGHT_TEST_AUTH_STATE__?.projects) {
        return window.__PLAYWRIGHT_TEST_AUTH_STATE__.projects;
    }

    const initialState = {
        projects: [],
        isAcc: null,
    };
    return initialState;
};

export const projectsSlice = createSlice({
    name: "projects",
    initialState: getInitialState(),
    reducers: {
        setProjects: (store, action) => {
            store.projects = action.payload;
        },
        setAcc: (store) => {
            store.isAcc = true;
        },
        setBim360: (store) => {
            store.isAcc = false;
        },
    },
});

export const { setProjects, setAcc, setBim360 } = projectsSlice.actions;
export default projectsSlice.reducer;
