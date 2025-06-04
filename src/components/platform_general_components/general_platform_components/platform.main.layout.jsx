import React from 'react';

import PlatformHeader from '../../platform_general_components/general_platform_components/platform.access.header'; 
import BayerAccSidebar from './acc.platform.sidebar.jsx'; 
import BayerFooter from '../../general/general.pages.footer.jsx'; 

const BayerPlatformMainLayout = ({ children, accountId, projectId }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PlatformHeader projectId={projectId} accountId={accountId} />
      <div className="flex flex-1 pt-16">
        <BayerAccSidebar />
        <main className="flex-1 p-3 overflow-y-auto">
          {children}
        </main>
      </div>
      <BayerFooter />
    </div>
  );
};

export default BayerPlatformMainLayout;