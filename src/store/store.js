import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/user/userSlice";
import projectsSlice from "./slices/projects/projectsSlice";

const store = configureStore({
    reducer: {
        user: userSlice,
        projects: projectsSlice,
    },
});

export default store;
