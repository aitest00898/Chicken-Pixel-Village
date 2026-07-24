import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tw.joe.chickenpixelvillage',
  appName: '雞情像素村',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  ios: { contentInset: 'automatic' },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: true,
      iosKeychainPrefix: 'tw.joe.chickenpixelvillage',
      androidIsEncryption: true,
      iosBiometric: { biometricAuth: true, biometricTitle: '解鎖雞情像素村' },
      androidBiometric: { biometricAuth: true, biometricTitle: '解鎖雞情像素村', biometricSubTitle: '使用裝置生物辨識' }
    }
  }
};

export default config;

