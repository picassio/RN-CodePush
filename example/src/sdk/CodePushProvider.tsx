import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import CustomCodePush, { CodePushConfiguration, UpdatePackage, SyncStatus } from './CustomCodePush';

interface CodePushContextType {
  codePush: CustomCodePush | null;
  currentUpdate: UpdatePackage | null;
  availableUpdate: UpdatePackage | null;
  syncStatus: SyncStatus | null;
  isChecking: boolean;
  isDownloading: boolean;
  isInstalling: boolean;
  checkForUpdate: () => Promise<void>;
  syncUpdate: () => Promise<void>;
  rollback: () => Promise<void>;
  clearUpdates: () => Promise<void>;
}

const CodePushContext = createContext<CodePushContextType | undefined>(undefined);

interface CodePushProviderProps {
  children: ReactNode;
  config: CodePushConfiguration;
  autoCheck?: boolean;
  checkOnResume?: boolean;
}

export const CodePushProvider: React.FC<CodePushProviderProps> = ({
  children,
  config,
  autoCheck = true,
  checkOnResume = true,
}) => {
  const [codePush] = useState(() => new CustomCodePush(config));
  const [currentUpdate, setCurrentUpdate] = useState<UpdatePackage | null>(null);
  const [availableUpdate, setAvailableUpdate] = useState<UpdatePackage | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    loadCurrentUpdate();
    
    if (autoCheck) {
      checkForUpdate();
    }

    // Set up app state listener for resume checks
    if (checkOnResume) {
      const handleAppStateChange = (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          checkForUpdate();
        }
      };

      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => subscription?.remove();
    }
  }, []);

  const loadCurrentUpdate = async () => {
    try {
      const current = await codePush.getCurrentPackage();
      setCurrentUpdate(current);
    } catch (error) {
      console.error('Failed to load current update:', error);
    }
  };

  const checkForUpdate = async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const update = await codePush.checkForUpdate();
      setAvailableUpdate(update);
    } catch (error) {
      console.error('Failed to check for update:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const syncUpdate = async () => {
    if (!availableUpdate || isDownloading || isInstalling) return;

    try {
      const success = await codePush.sync(
        {
          installMode: 'ON_NEXT_RESTART',
          mandatoryInstallMode: 'IMMEDIATE',
        },
        (status) => {
          setSyncStatus(status);
          
          switch (status.status) {
            case 'DOWNLOADING_PACKAGE':
              setIsDownloading(true);
              setIsInstalling(false);
              break;
            case 'INSTALLING_UPDATE':
              setIsDownloading(false);
              setIsInstalling(true);
              break;
            case 'UPDATE_INSTALLED':
            case 'UP_TO_DATE':
            case 'UNKNOWN_ERROR':
              setIsDownloading(false);
              setIsInstalling(false);
              break;
          }
        },
        (progress) => {
          // Handle download progress if needed
        }
      );

      if (success) {
        setAvailableUpdate(null);
        await loadCurrentUpdate();
      }
    } catch (error) {
      console.error('Failed to sync update:', error);
      setIsDownloading(false);
      setIsInstalling(false);
    }
  };

  const rollback = async () => {
    try {
      await codePush.rollback();
      setCurrentUpdate(null);
    } catch (error) {
      console.error('Failed to rollback:', error);
    }
  };

  const clearUpdates = async () => {
    try {
      await codePush.clearUpdates();
      setCurrentUpdate(null);
      setAvailableUpdate(null);
    } catch (error) {
      console.error('Failed to clear updates:', error);
    }
  };

  const contextValue: CodePushContextType = {
    codePush,
    currentUpdate,
    availableUpdate,
    syncStatus,
    isChecking,
    isDownloading,
    isInstalling,
    checkForUpdate,
    syncUpdate,
    rollback,
    clearUpdates,
  };

  return (
    <CodePushContext.Provider value={contextValue}>
      {children}
    </CodePushContext.Provider>
  );
};

export const useCodePush = (): CodePushContextType => {
  const context = useContext(CodePushContext);
  if (context === undefined) {
    throw new Error('useCodePush must be used within a CodePushProvider');
  }
  return context;
};