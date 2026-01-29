import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export const MVPBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('splitstay_mvp_banner_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('splitstay_mvp_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-blue-800">
            🚀 <span className="font-medium">You're using SplitStay MVP!</span>{' '}
            Found a bug or have feedback? Let us know in our WhatsApp Community
          </span>
        </div>
        {/* biome-ignore lint/a11y/useButtonType: Banner dismiss button */}
        <button
          onClick={handleDismiss}
          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
