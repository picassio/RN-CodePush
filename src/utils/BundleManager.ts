import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

/**
 * Optional utility for custom bundle paths. For OTA updates, prefer using
 * getBundleUrl() from useCodePush() or CustomCodePush.getBundleUrl() as the
 * single source of truth for the current bundle to load.
 */
export class BundleManager {
  private static readonly ORIGINAL_BUNDLE_PATH = Platform.select({
    ios: `${RNFS.MainBundlePath}/main.jsbundle`,
    android: 'assets://index.android.bundle',
  });

  private static readonly CUSTOM_BUNDLE_PATH = `${RNFS.DocumentDirectoryPath}/CustomCodePush/current.bundle`;

  /**
   * Get the path to the current bundle that should be loaded
   */
  public static getCurrentBundlePath(): string {
    // In a real implementation, this would check if a custom bundle exists
    // and return its path, otherwise return the original bundle path
    return BundleManager.CUSTOM_BUNDLE_PATH;
  }

  /**
   * Check if a custom bundle exists
   */
  public static async hasCustomBundle(): Promise<boolean> {
    try {
      return await RNFS.exists(BundleManager.CUSTOM_BUNDLE_PATH);
    } catch (error) {
      return false;
    }
  }

  /**
   * Copy a bundle from source to the current bundle location
   */
  public static async installBundle(sourcePath: string): Promise<void> {
    try {
      const bundlePath = `${sourcePath}/index.bundle`;
      
      if (!(await RNFS.exists(bundlePath))) {
        throw new Error('Bundle file not found in update package');
      }

      // Ensure directory exists
      const bundleDir = BundleManager.CUSTOM_BUNDLE_PATH.substring(
        0,
        BundleManager.CUSTOM_BUNDLE_PATH.lastIndexOf('/')
      );
      await RNFS.mkdir(bundleDir);

      // Copy bundle
      await RNFS.copyFile(bundlePath, BundleManager.CUSTOM_BUNDLE_PATH);

      // Copy assets if they exist
      const assetsSourcePath = `${sourcePath}/assets`;
      const assetsDestPath = `${bundleDir}/assets`;
      
      if (await RNFS.exists(assetsSourcePath)) {
        // Custom folder copy implementation needed here. For now, this is a placeholder.
        // TODO: Implement folder copy logic or use a third-party utility.
      }

    } catch (error) {
      console.error('Failed to install bundle:', error);
      throw error;
    }
  }

  /**
   * Remove the current custom bundle and revert to original
   */
  public static async removeCustomBundle(): Promise<void> {
    try {
      if (await RNFS.exists(BundleManager.CUSTOM_BUNDLE_PATH)) {
        await RNFS.unlink(BundleManager.CUSTOM_BUNDLE_PATH);
      }

      // Also remove assets directory
      const bundleDir = BundleManager.CUSTOM_BUNDLE_PATH.substring(
        0,
        BundleManager.CUSTOM_BUNDLE_PATH.lastIndexOf('/')
      );
      const assetsPath = `${bundleDir}/assets`;
      
      if (await RNFS.exists(assetsPath)) {
        await RNFS.unlink(assetsPath);
      }

    } catch (error) {
      console.error('Failed to remove custom bundle:', error);
      throw error;
    }
  }

  /**
   * Validate that a bundle is properly formatted
   */
  public static async validateBundle(bundlePath: string): Promise<boolean> {
    try {
      // Check if bundle file exists
      if (!(await RNFS.exists(bundlePath))) {
        return false;
      }

      // Check file size (should be > 0)
      const stats = await RNFS.stat(bundlePath);
      if (stats.size === 0) {
        return false;
      }

      // Additional validation could include:
      // - Checking bundle format
      // - Verifying bundle signature
      // - Testing bundle loading

      return true;
    } catch (error) {
      console.error('Bundle validation failed:', error);
      return false;
    }
  }

  /**
   * Get bundle metadata
   */
  public static async getBundleMetadata(bundlePath: string): Promise<any> {
    try {
      const metadataPath = `${bundlePath}/metadata.json`;
      
      if (await RNFS.exists(metadataPath)) {
        const metadataContent = await RNFS.readFile(metadataPath, 'utf8');
        return JSON.parse(metadataContent);
      }

      return null;
    } catch (error) {
      console.error('Failed to read bundle metadata:', error);
      return null;
    }
  }
}