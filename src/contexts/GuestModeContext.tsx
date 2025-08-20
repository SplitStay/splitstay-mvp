import { createContext, useContext, useState, ReactNode } from 'react';

interface PendingAction {
  type: 'message' | 'create_trip' | 'join_trip';
  data?: any;
  redirectTo?: string;
}

interface GuestModeContextType {
  isGuestMode: boolean;
  pendingAction: PendingAction | null;
  setPendingAction: (action: PendingAction | null) => void;
  clearPendingAction: () => void;
  triggerAuthForAction: (action: PendingAction) => void;
}

const GuestModeContext = createContext<GuestModeContextType | undefined>(undefined);

export const useGuestMode = () => {
  const context = useContext(GuestModeContext);
  if (context === undefined) {
    throw new Error('useGuestMode must be used within a GuestModeProvider');
  }
  return context;
};

interface GuestModeProviderProps {
  children: ReactNode;
}

export const GuestModeProvider: React.FC<GuestModeProviderProps> = ({ children }) => {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const clearPendingAction = () => {
    setPendingAction(null);
  };

  const triggerAuthForAction = (action: PendingAction) => {
    setPendingAction(action);
    localStorage.setItem('splitstay_pending_action', JSON.stringify(action));
  };

  const isGuestMode = true;

  const value = {
    isGuestMode,
    pendingAction,
    setPendingAction,
    clearPendingAction,
    triggerAuthForAction,
  };

  return (
    <GuestModeContext.Provider value={value}>
      {children}
    </GuestModeContext.Provider>
  );
};
