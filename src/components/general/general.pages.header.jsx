import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { User, LogOut, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

const backendUrl = import.meta.env.VITE_API_BACKEND_BASE_URL;

/**
 * Site header component displaying login or user info after authentication.
 * Fetches user profile and uses shadcn/ui components for layout.
 * @returns {JSX.Element}
 */
export function BayerHeader() {
  const [cookies] = useCookies(['access_token']);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Fetch user profile
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const response = await fetch(`${backendUrl}/general/user/profile`, {
          credentials: "include",
        });

        if (!response.ok) {
          console.error("Error fetching user profile:");
          setError("Error fetching user profile");
          return;
        }

        const {data} = await response.json();

        setUserProfile(data.emailId);
      } catch (error) {
        setError(
          error?.response?.data?.message || "Error fetching user profile"
        );
      }
    };
    getUserProfile();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const res = await fetch(`${backendUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Logout failed');
      setUserProfile(null);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSelectPlatform = () => navigate('/platform');
  const handleSignin = () => navigate('/login');

  const getDisplayName = () => {
    if (!userProfile) return '';
    return userProfile ||  'Unknown User';
  };

  const getInitials = () => {
    if (!userProfile) return 'U';
    const Inital = userProfile || '';
    if (Inital) return `${Inital[0]}`.toUpperCase();
    return (Inital ||  'U')[0].toUpperCase();
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 z-50 w-full h-16 flex items-center justify-between px-6 bg-white border-b shadow"
        role="banner"
      >
        {/* Branding */}
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            BAYER CROP SCIENCE BIM APP
          </Link>
        </div>

        {/* Navigation & User */}
        <div className="flex items-center gap-6" ref={containerRef}>
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center space-x-4"
          >
            <Link
              to="/"
              className="text-gray-800 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-2">
            { userProfile ? (
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-auto p-2 w-auto"
                    disabled={isLoggingOut}
                  >
                    <span className="text-sm font-medium">
                      {getDisplayName()}
                    </span>
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={userProfile.avatar || '/placeholder.svg'}
                        alt={getDisplayName()}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-auto">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={userProfile.avatar || '/placeholder.svg'}
                        alt={getDisplayName()}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {getDisplayName()}
                      </span>
                      {userProfile.email && (
                        <span className="text-xs text-gray-500">
                          {userProfile.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSelectPlatform}>
                    <Settings className="mr-2 h-4 w-4" />
                    Select Platform
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={handleLogout}
                    disabled={isLoggingOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    {isLoggingOut ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-gray-800 hover:text-blue-600"
                onClick={handleSignin}
              >
                <User className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-auto p-0 text-xs"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
}

export default React.memo(BayerHeader);
