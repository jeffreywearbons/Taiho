import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wearbons.taiho',
  appName: 'TAIHO!!',
  webDir: 'dist',
  backgroundColor: '#141420',
  server: { androidScheme: 'https' },
  ios: { contentInset: 'never' },
};
export default config;
