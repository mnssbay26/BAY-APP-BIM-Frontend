import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import BayerHeader from '../../components/general/general.pages.header.jsx';

/**
 * Login page component for Autodesk authentication.
 * Handles redirect to Autodesk OAuth and logout flow.
 * @returns {JSX.Element}
 */
const LoginPage = () => {
  const [cookies] = useCookies(['access_token']);
  const navigate = useNavigate();

  const CLIENT_ID = import.meta.env.VITE_API_CLIENT_ID;
  const BACKEND_BASE_URL = import.meta.env.VITE_API_BACKEND_BASE_URL;

  /**
   * Redirects user to Autodesk OAuth login page.
   */
  const login = () => {
    if (!CLIENT_ID) {
      console.error('Missing VITE_API_CLIENT_ID environment variable');
      return;
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: `${BACKEND_BASE_URL}/auth/three-legged`,
      scope: 'data:read data:write data:create account:read',
    });

    window.location.href = `https://developer.api.autodesk.com/authentication/v2/authorize?${params.toString()}`;
  };

  /**
   * Logs out the user by calling backend and clearing cookies.
   */
  const logout = async () => {
    try {
      await fetch(`${BACKEND_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <BayerHeader />

      <main className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 py-20 gap-10 mt-16">
        {/* Title Section */}
        <div className="w-full md:w-1/2 text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">BAYER BIM APP</h1>
          <h2 className="text-2xl text-gray-700">
            {cookies.token ? 'Welcome back' : 'Login with Autodesk'}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="w-full md:w-1/2 flex flex-col items-center space-y-6">
          {cookies.token ? (
            <>
              <button
                onClick={logout}
                className="bg-[#10384F] text-white px-6 py-3 rounded-lg hover:bg-[#89D329] transition-colors w-48"
                aria-label="Logout from Autodesk"
              >
                Logout
              </button>
              <button
                onClick={() => navigate('/platform')}
                className="bg-[#10384F] text-white px-6 py-3 rounded-lg hover:bg-[#89D329] transition-colors w-48"
                aria-label="Go to platform selection"
              >
                Select Platform
              </button>
            </>
          ) : (
            <button
              onClick={login}
              className="bg-[#10384F] text-white px-6 py-3 rounded-lg hover:bg-[#89D329] transition-colors w-48"
              aria-label="Login with Autodesk"
            >
              Login with Autodesk
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default React.memo(LoginPage);
