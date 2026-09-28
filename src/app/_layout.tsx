import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { appKit } from '@/configs/appKit';
import { AppKit, AppKitProvider } from '@reown/appkit-react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';


SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <AppKitProvider instance={appKit}>
          <AnimatedSplashOverlay />
          <AppTabs />
          <AppKit />
        </AppKitProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
