import { AnimatePresence, motion } from 'framer-motion';
import {
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Plus,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface MobileNavigationProps {
  isGuest: boolean;
  onAuthRequired: (action: string) => void;
  // biome-ignore lint/suspicious/noExplicitAny: User type from auth context
  user?: any;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isGuest,
  onAuthRequired,
  user,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleNavigation = (
    path: string,
    requiresAuth = false,
    action?: string,
  ) => {
    if (requiresAuth && isGuest && action) {
      onAuthRequired(action);
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const menuItems = isGuest
    ? [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Find Partners', path: '/find-partners' },
        {
          icon: Plus,
          label: 'Add Trip',
          action: 'create_trip',
          requiresAuth: true,
        },
        {
          icon: Sparkles,
          label: 'Create Profile',
          action: 'create_profile',
          requiresAuth: true,
        },
      ]
    : [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Find Partners', path: '/find-partners' },
        { icon: Plus, label: 'Add Trip', path: '/post-trip' },
        { icon: MessageCircle, label: 'Messages', path: '/messages' },
        { icon: User, label: 'My Profile', path: `/profile/${user?.id}` },
      ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="text-xl font-bold text-blue-600">
            SplitStay
          </Link>
          {/* biome-ignore lint/a11y/useButtonType: Menu toggle button */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Link
                  to="/dashboard"
                  className="text-xl font-bold text-blue-600"
                  onClick={() => setIsOpen(false)}
                >
                  SplitStay
                </Link>
                {/* biome-ignore lint/a11y/useButtonType: Close sidebar button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* User Info */}
              {!isGuest && user && (
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Info */}
              {isGuest && (
                <div className="p-4 border-b border-gray-200">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800 font-medium">
                      <Sparkles className="inline w-4 h-4 mr-1" />
                      Browsing as Guest
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Sign up to post trips and message travelers!
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Menu */}
              <nav className="p-4">
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    // biome-ignore lint/a11y/useButtonType: Navigation button
                    <button
                      key={item.label}
                      onClick={() =>
                        handleNavigation(
                          item.path || '',
                          item.requiresAuth,
                          item.action,
                        )
                      }
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Sign Out Button for logged-in users */}
                {!isGuest && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {/* biome-ignore lint/a11y/useButtonType: Sign out button */}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
