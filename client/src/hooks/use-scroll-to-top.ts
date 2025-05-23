import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * A hook that scrolls the window to the top on route change
 */
export const useScrollToTop = () => {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};