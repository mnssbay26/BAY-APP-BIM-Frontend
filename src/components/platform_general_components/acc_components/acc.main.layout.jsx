import React from "react";

import Acc360ProjectsHeader from "../../headers/acc.platform.projects.header";
import BayerAccSidebar from "./acc.platform.sidebar.jsx";
import BayerFooter from "../../general/general.pages.footer.jsx";

const BayerAccMainLayout = ({ children, projectId, accountId }) => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Acc360ProjectsHeader projectId={projectId} accountId={accountId} />
            <div className="flex flex-1 pt-16">
                <BayerAccSidebar />
                <main className="flex-1 p-3 overflow-y-auto">{children}</main>
            </div>
            <BayerFooter />
        </div>
    );
};

export default BayerAccMainLayout;
