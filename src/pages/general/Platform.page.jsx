import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import BayerHeader from '../../components/general/general.pages.header.jsx';

/**
 * Platform selection page allowing navigation to BIM360 or ACC modules.
 * @returns {JSX.Element}
 */
const PlatformPage = () => {
  const [cookies] = useCookies(['access_token']);
  const navigate = useNavigate();
  const { search } = useLocation(); // reserved for future query parameters

  /**
   * Navigate to BIM 360 projects list.
   */
  const goToBim360 = () => navigate('/bim360/projects' + search);

  /**
   * Navigate to ACC projects list.
   */
  const goToAcc = () => navigate('/acc/projects' + search);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <BayerHeader />

      <main className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-20 gap-10 mt-16">
        {/* Left Side */}
        <section className="w-full md:w-1/2 text-center space-y-4" aria-labelledby="platform-title">
          <h1 id="platform-title" className="text-5xl font-bold text-gray-900">
            BAYER BIM APP
          </h1>
          <h2 className="text-2xl text-gray-700">Select a platform to continue</h2>
        </section>

        {/* Right Side Actions */}
        <section className="w-full md:w-1/2 flex flex-col items-center space-y-6" aria-label="Platform actions">
          <button
            onClick={goToBim360}
            className="bg-[#10384F] text-white px-6 py-3 rounded-lg hover:bg-[#89D329] transition-colors w-48"
            aria-label="Go to BIM 360 projects"
          >
            BIM 360
          </button>
          <button
            onClick={goToAcc}
            className="bg-[#10384F] text-white px-6 py-3 rounded-lg hover:bg-[#89D329] transition-colors w-48"
            aria-label="Go to Autodesk Construction Cloud projects"
          >
            ACC
          </button>
        </section>
      </main>
    </div>
  );
};

export default React.memo(PlatformPage);