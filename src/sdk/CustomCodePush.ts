import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import { Platform, NativeModules } from 'react-native';

export interface CodePushConfiguration {
  serverUrl: string;
  deploymentKey: string;
  checkFrequency?: 'ON_APP_START' | 'ON_APP_RESUME' | 'MANUAL';
  installMode?: 'IMMEDIATE' | 'ON_NEXT_RESTART' | 'ON_NEXT_RESUME';
  minimumBackgroundDuration?: number;
}

export interface UpdatePackage {
  packageHash: string;
  label: string;
  appVersion: string;
  description: string;
  isMandatory: boolean;
  packageSize: number;
  downloadUrl: string;
  rollout?: number;
  isDisabled?: boolean;
  timestamp: number;
}

export interface SyncStatus {
  status: 'CHECKING_FOR_UPDATE' | 'DOWNLOADING_PACKAGE' | 'INSTALLING_UPDATE' | 
          'UP_TO_DATE' | 'UPDATE_INSTALLED' | 'UPDATE_IGNORED' | 'UNKNOWN_ERROR' | 
          'AWAITING_USER_ACTION';
  progress?: number;
  downloadedBytes?: number;
  totalBytes?: number;
}

export interface LocalPackage extends UpdatePackage {
  localPath: string;
  isFirstRun: boolean;
  failedInstall: boolean;
}

export type SyncStatusCallback = (status: SyncStatus) => void;
export type DownloadProgressCallback = (progress: { receivedBytes: number; totalBytes: number }) => void;

class CustomCodePush {
  private config: CodePushConfiguration;
  private currentPackage: LocalPackage | null = null;
  // Promise that resolves when directories are initialized and current package loaded
  private readyPromise: Promise<void>;
  private pendingUpdate: UpdatePackage | null = null;
  private isCheckingForUpdate = false;
  private isDownloading = false;
  private isInstalling = false;

  // Storage keys
  private static readonly CURRENT_PACKAGE_KEY = 'CustomCodePush_CurrentPackage';
  private static readonly PENDING_UPDATE_KEY = 'CustomCodePush_PendingUpdate';
  private static readonly FAILED_UPDATES_KEY = 'CustomCodePush_FailedUpdates';
  private static readonly UPDATE_METADATA_KEY = 'CustomCodePush_UpdateMetadata';

  // File paths
  private static readonly UPDATES_FOLDER = `${RNFS.DocumentDirectoryPath}/CustomCodePush`;
  private static readonly BUNDLES_FOLDER = `${CustomCodePush.UPDATES_FOLDER}/bundles`;
  private static readonly DOWNLOADS_FOLDER = `${CustomCodePush.UPDATES_FOLDER}/downloads`;

  constructor(config: CodePushConfiguration) {
    this.config = {
      checkFrequency: 'ON_APP_START',
      installMode: 'ON_NEXT_RESTART',
      minimumBackgroundDuration: 0,
      ...config,
    };
    // Initialize directories and load stored package before SDK use
    this.readyPromise = (async () => {
      await this.initializeDirectories();
      await this.loadCurrentPackage();
    })();
  }

  /**
   * Wait for SDK initialization (directories + stored package loaded)
   */
  public async initialize(): Promise<void> {
    return this.readyPromise;
  }

  private async initializeDirectories(): Promise<void> {
    try {
      await RNFS.mkdir(CustomCodePush.UPDATES_FOLDER);
      await RNFS.mkdir(CustomCodePush.BUNDLES_FOLDER);
      await RNFS.mkdir(CustomCodePush.DOWNLOADS_FOLDER);
    } catch (error) {
      console.warn('Failed to create directories:', error);
    }
  }

  private async loadCurrentPackage(): Promise<void> {
    try {
      const packageData = await AsyncStorage.getItem(CustomCodePush.CURRENT_PACKAGE_KEY);
      if (packageData) {
        this.currentPackage = JSON.parse(packageData);
      }
    } catch (error) {
      console.warn('Failed to load current package:', error);
    }
  }

  private async saveCurrentPackage(packageInfo: LocalPackage): Promise<void> {
    try {
      await AsyncStorage.setItem(CustomCodePush.CURRENT_PACKAGE_KEY, JSON.stringify(packageInfo));
      this.currentPackage = packageInfo;
    } catch (error) {
      console.warn('Failed to save current package:', error);
    }
  }

  private async getDeviceInfo(): Promise<any> {
    return {
      platform: Platform.OS,
      platformVersion: Platform.Version,
      appVersion: await DeviceInfo.getVersion(),
      deviceId: await DeviceInfo.getUniqueId(),
      deviceModel: await DeviceInfo.getModel(),
      clientUniqueId: await DeviceInfo.getUniqueId(),
      currentPackageHash: this.currentPackage?.packageHash || null,
    };
  }

  public async checkForUpdate(): Promise<UpdatePackage | null> {
    if (this.isCheckingForUpdate) {
      throw new Error('Already checking for update');
    }

    this.isCheckingForUpdate = true;

    try {
      const deviceInfo = await this.getDeviceInfo();
      
      const response = await fetch(`${this.config.serverUrl}/api/v1/update_check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deploymentKey: this.config.deploymentKey,
          appVersion: deviceInfo.appVersion || '1.0.0',
          packageHash: this.currentPackage?.packageHash,
          clientUniqueId: deviceInfo.clientUniqueId,
          label: this.currentPackage?.label,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.updateInfo) {
        const updatePackage: UpdatePackage = {
          packageHash: data.updateInfo.packageHash,
          label: data.updateInfo.label,
          appVersion: data.updateInfo.appVersion,
          description: data.updateInfo.description || '',
          isMandatory: data.updateInfo.isMandatory || false,
          packageSize: data.updateInfo.size || 0,
          downloadUrl: data.updateInfo.downloadUrl,
          rollout: data.updateInfo.rollout,
          isDisabled: data.updateInfo.isDisabled,
          timestamp: Date.now(),
        };

        this.pendingUpdate = updatePackage;
        return updatePackage;
      }

      return null;
    } catch (error) {
      console.log('Error checking for update:', error);
      console.error('Error checking for update:', error);
      throw error;
    } finally {
      this.isCheckingForUpdate = false;
    }
  }

  public async downloadUpdate(
    updatePackage: UpdatePackage,
    progressCallback?: DownloadProgressCallback
  ): Promise<LocalPackage> {
    if (this.isDownloading) {
      throw new Error('Already downloading update');
    }

    this.isDownloading = true;

    try {
      // Check if it's a JavaScript file (demo bundles)
      const isJsFile = updatePackage.downloadUrl.endsWith('.js');
      const fileExtension = isJsFile ? 'js' : 'zip';
      const downloadPath = `${CustomCodePush.DOWNLOADS_FOLDER}/${updatePackage.packageHash}.${fileExtension}`;
      
      // Clean up any existing download
      if (await RNFS.exists(downloadPath)) {
        await RNFS.unlink(downloadPath);
      }

      const downloadResult = await RNFS.downloadFile({
        fromUrl: updatePackage.downloadUrl,
        toFile: downloadPath,
        progress: (res) => {
          if (progressCallback) {
            progressCallback({
              receivedBytes: res.bytesWritten,
              totalBytes: res.contentLength,
            });
          }
        },
      }).promise;

      if (downloadResult.statusCode !== 200) {
        throw new Error(`Download failed with status ${downloadResult.statusCode}`);
      }

      // Verify file size (approximate for JS files)
      const fileStats = await RNFS.stat(downloadPath);
      if (isJsFile) {
        // For JS files, just check if file exists and has content
        if (fileStats.size === 0) {
          throw new Error('Downloaded JavaScript file is empty');
        }
      } else {
        // For zip files, require non-empty; allow tolerance (CDN/compression can vary)
        if (fileStats.size <= 0) {
          throw new Error('Downloaded file is empty');
        }
        if (updatePackage.packageSize > 0) {
          const tolerance = 0.1;
          const minSize = updatePackage.packageSize * (1 - tolerance);
          const maxSize = updatePackage.packageSize * (1 + tolerance);
          if (fileStats.size < minSize || fileStats.size > maxSize) {
            console.warn(
              `Download size ${fileStats.size} outside expected range [${minSize}, ${maxSize}]; proceeding anyway`
            );
          }
        }
      }

      let localPath: string;

      if (isJsFile) {
        // For JavaScript files, create a simple structure
        localPath = `${CustomCodePush.BUNDLES_FOLDER}/${updatePackage.packageHash}`;
        await RNFS.mkdir(localPath);
        
        // Copy the JS file to the bundle location
        const bundlePath = `${localPath}/index.bundle`;
        await RNFS.copyFile(downloadPath, bundlePath);
        
        // Clean up download file
        await RNFS.unlink(downloadPath);
      } else {
        // For zip files, extract as before
        localPath = `${CustomCodePush.BUNDLES_FOLDER}/${updatePackage.packageHash}`;
        await RNFS.mkdir(localPath);
        await unzip(downloadPath, localPath);
        
        // Clean up download file
        await RNFS.unlink(downloadPath);
      }

      const localPackage: LocalPackage = {
        ...updatePackage,
        localPath: localPath,
        isFirstRun: false,
        failedInstall: false,
      };

      // Save update metadata
      await AsyncStorage.setItem(
        `${CustomCodePush.UPDATE_METADATA_KEY}_${updatePackage.packageHash}`,
        JSON.stringify(localPackage)
      );

      await this.logDownloadReport(updatePackage);

      return localPackage;
    } catch (error) {
      console.error('Error downloading update:', error);
      throw error;
    } finally {
      this.isDownloading = false;
    }
  }

  public async installUpdate(localPackage: LocalPackage): Promise<void> {
    if (this.isInstalling) {
      throw new Error('Already installing update');
    }

    this.isInstalling = true;

    try {
      // Validate the package
      const bundlePath = `${localPackage.localPath}/index.bundle`;
      if (!(await RNFS.exists(bundlePath))) {
        throw new Error('Bundle file not found in update package');
      }

      // Mark as current package
      await this.saveCurrentPackage(localPackage);

      // Clear pending update
      this.pendingUpdate = null;
      await AsyncStorage.removeItem(CustomCodePush.PENDING_UPDATE_KEY);

      // Log installation
      await this.logUpdateInstallation(localPackage, true);

    } catch (error) {
      console.error('Error installing update:', error);
      await this.logUpdateInstallation(localPackage, false);
      throw error;
    } finally {
      this.isInstalling = false;
    }
  }

  private async logDownloadReport(updatePackage: UpdatePackage): Promise<void> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      await fetch(`${this.config.serverUrl}/api/v1/report_status/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deploymentKey: this.config.deploymentKey,
          label: updatePackage.label,
          clientUniqueId: deviceInfo.clientUniqueId,
        }),
      });
    } catch (error) {
      console.warn('Failed to report download status:', error);
    }
  }

  private async logUpdateInstallation(localPackage: LocalPackage, success: boolean): Promise<void> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      
      await fetch(`${this.config.serverUrl}/api/v1/report_status/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deploymentKey: this.config.deploymentKey,
          label: localPackage.label,
          status: success ? 'Deployed' : 'Failed',
          clientUniqueId: deviceInfo.clientUniqueId,
        }),
      });
    } catch (error) {
      console.warn('Failed to log update installation:', error);
    }
  }

  public async sync(
    options: {
      installMode?: 'IMMEDIATE' | 'ON_NEXT_RESTART' | 'ON_NEXT_RESUME';
      mandatoryInstallMode?: 'IMMEDIATE' | 'ON_NEXT_RESTART' | 'ON_NEXT_RESUME';
      updateDialog?: boolean;
      rollbackRetryOptions?: {
        delayInHours?: number;
        maxRetryAttempts?: number;
      };
    } = {},
    statusCallback?: SyncStatusCallback,
    downloadProgressCallback?: DownloadProgressCallback
  ): Promise<boolean> {
    try {
      // Check for update
      statusCallback?.({ status: 'CHECKING_FOR_UPDATE' });
      const updatePackage = await this.checkForUpdate();

      if (!updatePackage) {
        statusCallback?.({ status: 'UP_TO_DATE' });
        return false;
      }

      // Show update dialog if needed
      if (options.updateDialog && updatePackage.isMandatory) {
        statusCallback?.({ status: 'AWAITING_USER_ACTION' });
        // In a real implementation, you would show a native dialog here
        // For now, we'll proceed automatically
      }

      // Download update
      statusCallback?.({ status: 'DOWNLOADING_PACKAGE', progress: 0 });
      const localPackage = await this.downloadUpdate(updatePackage, (progress) => {
        const progressPercent = (progress.receivedBytes / progress.totalBytes) * 100;
        statusCallback?.({
          status: 'DOWNLOADING_PACKAGE',
          progress: progressPercent,
          downloadedBytes: progress.receivedBytes,
          totalBytes: progress.totalBytes,
        });
        downloadProgressCallback?.(progress);
      });

      // Install update
      statusCallback?.({ status: 'INSTALLING_UPDATE' });
      await this.installUpdate(localPackage);

      const installMode = updatePackage.isMandatory 
        ? (options.mandatoryInstallMode || 'IMMEDIATE')
        : (options.installMode || this.config.installMode || 'ON_NEXT_RESTART');

      if (installMode === 'IMMEDIATE') {
        // Restart the app immediately
        this.restartApp();
      }

      statusCallback?.({ status: 'UPDATE_INSTALLED' });
      return true;

    } catch (error) {
      console.error('Sync error:', error);
      statusCallback?.({ status: 'UNKNOWN_ERROR' });
      return false;
    }
  }

  public async getCurrentPackage(): Promise<LocalPackage | null> {
    return this.currentPackage;
  }

  public async getUpdateMetadata(): Promise<LocalPackage | null> {
    return this.currentPackage;
  }

  public async clearUpdates(): Promise<void> {
    try {
      // Clear storage
      await AsyncStorage.multiRemove([
        CustomCodePush.CURRENT_PACKAGE_KEY,
        CustomCodePush.PENDING_UPDATE_KEY,
        CustomCodePush.FAILED_UPDATES_KEY,
      ]);

      // Clear files
      if (await RNFS.exists(CustomCodePush.UPDATES_FOLDER)) {
        await RNFS.unlink(CustomCodePush.UPDATES_FOLDER);
      }

      // Reinitialize
      await this.initializeDirectories();
      this.currentPackage = null;
      this.pendingUpdate = null;

    } catch (error) {
      console.error('Error clearing updates:', error);
      throw error;
    }
  }

  public async rollback(): Promise<void> {
    if (!this.currentPackage) {
      throw new Error('No current package to rollback from');
    }

    try {
      // Remove current package
      const packagePath = this.currentPackage.localPath;
      if (await RNFS.exists(packagePath)) {
        await RNFS.unlink(packagePath);
      }

      // Clear current package
      await AsyncStorage.removeItem(CustomCodePush.CURRENT_PACKAGE_KEY);
      this.currentPackage = null;

      // Log rollback
      await this.logRollback();

      // Restart app to use original bundle
      this.restartApp();

    } catch (error) {
      console.error('Error during rollback:', error);
      throw error;
    }
  }

  private async logRollback(): Promise<void> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      
      await fetch(`${this.config.serverUrl}/api/v1/report_status/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deploymentKey: this.config.deploymentKey,
          label: this.currentPackage?.label || 'unknown',
          status: 'Rollback',
          clientUniqueId: deviceInfo.clientUniqueId,
        }),
      });
    } catch (error) {
      console.warn('Failed to log rollback:', error);
    }
  }

  private restartApp(): void {
    // In a real implementation, you would use a native module to restart the app
    // For now, we'll just reload the React Native bundle
    if (Platform.OS === 'android') {
      // Android restart implementation
      NativeModules.DevSettings?.reload();
    } else {
      // iOS restart implementation
      NativeModules.DevSettings?.reload();
    }
  }

  public getBundleUrl(): string | null {
    if (this.currentPackage && this.currentPackage.localPath) {
      return `file://${this.currentPackage.localPath}/index.bundle`;
    }
    return null;
  }

  // Static methods for easy integration
  public static configure(config: CodePushConfiguration): CustomCodePush {
    return new CustomCodePush(config);
  }

  public static async checkForUpdate(instance: CustomCodePush): Promise<UpdatePackage | null> {
    return instance.checkForUpdate();
  }

  public static async sync(
    instance: CustomCodePush,
    options?: any,
    statusCallback?: SyncStatusCallback,
    downloadProgressCallback?: DownloadProgressCallback
  ): Promise<boolean> {
    return instance.sync(options, statusCallback, downloadProgressCallback);
  }
}

export default CustomCodePush;