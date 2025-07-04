import { CodePushUpdate, CodePushDeployment, CodePushSyncStatus, UpdateHistory } from '@/types/codepush';

// Mock service for demonstration - replace with actual CodePush SDK calls
class CodePushService {
  private mockDeployments: CodePushDeployment[] = [
    {
      name: 'Production',
      key: 'prod-key-12345678',
      package: {
        id: '1',
        label: 'v1.2.3',
        description: 'Bug fixes and performance improvements',
        packageHash: 'abc123def456',
        blobUrl: 'https://codepush.blob.core.windows.net/package1',
        downloadUrl: 'https://codepush.blob.core.windows.net/package1',
        packageSize: 2048576,
        deploymentKey: 'prod-key-12345678',
        isFirstRun: false,
        failedInstall: false,
        isMandatory: false,
        timestamp: Date.now() - 86400000,
        version: '1.2.3'
      }
    },
    {
      name: 'Staging',
      key: 'staging-key-87654321',
      package: {
        id: '2',
        label: 'v1.2.4-beta',
        description: 'New feature preview and experimental changes',
        packageHash: 'def456ghi789',
        blobUrl: 'https://codepush.blob.core.windows.net/package2',
        downloadUrl: 'https://codepush.blob.core.windows.net/package2',
        packageSize: 3145728,
        deploymentKey: 'staging-key-87654321',
        isFirstRun: false,
        failedInstall: false,
        isMandatory: true,
        timestamp: Date.now() - 3600000,
        version: '1.2.4'
      }
    },
    {
      name: 'Development',
      key: 'dev-key-11223344',
    }
  ];

  private mockHistory: UpdateHistory[] = [
    {
      id: '1',
      version: '1.2.3',
      timestamp: Date.now() - 86400000,
      status: 'SUCCESS',
      description: 'Bug fixes and performance improvements',
      downloadSize: 2048576,
    },
    {
      id: '2',
      version: '1.2.2',
      timestamp: Date.now() - 172800000,
      status: 'SUCCESS',
      description: 'UI improvements and new dashboard features',
      downloadSize: 1536000,
    },
    {
      id: '3',
      version: '1.2.1',
      timestamp: Date.now() - 259200000,
      status: 'ROLLBACK',
      description: 'Critical bug fix rollback',
      downloadSize: 1024000,
    },
    {
      id: '4',
      version: '1.2.0',
      timestamp: Date.now() - 345600000,
      status: 'FAILED',
      description: 'Major feature update with new authentication',
      downloadSize: 4096000,
    }
  ];

  async checkForUpdate(): Promise<CodePushUpdate | null> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 70% chance of no update, 30% chance of update available
    if (Math.random() > 0.3) {
      return null;
    }

    return {
      id: 'update-' + Date.now(),
      label: 'v1.2.5',
      description: 'Security updates and bug fixes',
      packageHash: 'new-hash-123',
      blobUrl: 'https://codepush.blob.core.windows.net/new-package',
      downloadUrl: 'https://codepush.blob.core.windows.net/new-package',
      packageSize: 1843200,
      deploymentKey: 'prod-key-12345678',
      isFirstRun: false,
      failedInstall: false,
      isMandatory: false,
      timestamp: Date.now(),
      version: '1.2.5'
    };
  }

  async downloadUpdate(
    update: CodePushUpdate,
    onProgress: (progress: number) => void
  ): Promise<boolean> {
    // Simulate download progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      onProgress(i);
    }
    return true;
  }

  async installUpdate(): Promise<boolean> {
    // Simulate installation
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  }

  async sync(onStatusChange: (status: CodePushSyncStatus) => void): Promise<boolean> {
    onStatusChange({ status: 'CHECKING_FOR_UPDATE' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const update = await this.checkForUpdate();
    
    if (!update) {
      onStatusChange({ status: 'UP_TO_DATE' });
      return false;
    }

    onStatusChange({ status: 'DOWNLOADING_PACKAGE', progress: 0 });
    
    const downloadSuccess = await this.downloadUpdate(update, (progress) => {
      onStatusChange({ status: 'DOWNLOADING_PACKAGE', progress });
    });

    if (!downloadSuccess) {
      onStatusChange({ status: 'UNKNOWN_ERROR' });
      return false;
    }

    onStatusChange({ status: 'INSTALLING_UPDATE' });
    const installSuccess = await this.installUpdate();

    if (installSuccess) {
      onStatusChange({ status: 'UPDATE_INSTALLED' });
      return true;
    } else {
      onStatusChange({ status: 'UNKNOWN_ERROR' });
      return false;
    }
  }

  async getDeployments(): Promise<CodePushDeployment[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockDeployments;
  }

  async getUpdateHistory(): Promise<UpdateHistory[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockHistory;
  }

  async getCurrentPackageInfo(): Promise<CodePushUpdate | null> {
    // Return current package info
    return this.mockDeployments[0].package || null;
  }
}

export const codePushService = new CodePushService();