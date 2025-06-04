import React from 'react';

import Bim360ProjectsHeader from '../../platform_general_components/bim360_components/bim360.platform.projects.header'; 
import BayerBim360Sidebar from './bim360.platform.sidebar.jsx'; 
import BayerFooter from '../../general/general.pages.footer.jsx'; 

const BayerBim360MainLayout = ({ children, projectId, accountId}) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Bim360ProjectsHeader projectId={projectId} accountId={accountId} />
      <div className="flex flex-1 pt-16"> 
        <BayerBim360Sidebar />
        <main className="flex-1 p-3 overflow-y-auto">
          {children}
        </main>
      </div>
      <BayerFooter />
    </div>
  );
};

export default BayerBim360MainLayout;