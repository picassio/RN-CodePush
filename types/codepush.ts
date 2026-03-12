export interface CodePushUpdate {
  id: string;
  label: string;
  description: string;
  packageHash: string;
  blobUrl: string;
  downloadUrl: string;
  packageSize: number;
  deploymentKey: string;
  isFirstRun: boolean;
  failedInstall: boolean;
  isMandatory: boolean;
  timestamp: number;
  version: string;
}

export interface CodePushDeployment {
  name: string;
  key: string;
  package?: CodePushUpdate;
}

export interface CodePushSyncStatus {
  status: 'UP_TO_DATE' | 'UPDATE_INSTALLED' | 'UPDATE_IGNORED' | 'UNKNOWN_ERROR' | 'SYNC_IN_PROGRESS' | 'CHECKING_FOR_UPDATE' | 'AWAITING_USER_ACTION' | 'DOWNLOADING_PACKAGE' | 'INSTALLING_UPDATE';
  progress?: number;
}

export interface CodePushConfiguration {
  deploymentKey: string;
  serverUrl: string;
  checkFrequency: 'ON_APP_START' | 'ON_APP_RESUME' | 'MANUAL';
  installMode: 'IMMEDIATE' | 'ON_NEXT_RESTART' | 'ON_NEXT_RESUME';
  minimumBackgroundDuration: number;
}

export interface UpdateHistory {
  id: string;
  version: string;
  timestamp: number;
  status: 'SUCCESS' | 'FAILED' | 'ROLLBACK';
  description: string;
  downloadSize: number;
}