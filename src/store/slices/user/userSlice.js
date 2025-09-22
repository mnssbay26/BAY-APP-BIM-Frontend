// this slice keeps hold of data about the user
import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
    if (window.__PLAYWRIGHT_TEST_AUTH_STATE__?.user) {
        return window.__PLAYWRIGHT_TEST_AUTH_STATE__.user;
    }

    const initialState = {
        isLoggedIn: false,
        userData: null,
        accountId: null,
    };
    return initialState;
};

export const userSlice = createSlice({
    name: "user",
    initialState: getInitialState(),
    reducers: {
        setLoggedIn: (store) => {
            store.isLoggedIn = true;
        },
        setLoggedOut: (store) => (store.isLoggedIn = false),
        // this needs to be changed to enforce a type
        // once we switch to TS
        setUserData: (store, action) => {
            store.userData = action.payload;
        },
        setAccountId: (store, action) => {
            store.accountId = action.payload;
        },
    },
});

export const selectUserProfile = (store) => {
    const emailId = store.user.userData?.data?.user?.emailId;
    return emailId;
};
export const { setLoggedIn, setLoggedOut, setUserData, setAccountId } =
    userSlice.actions;
export default userSlice.reducer;
