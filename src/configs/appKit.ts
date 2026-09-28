import AsyncStorage from '@react-native-async-storage/async-storage';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import { createAppKit, type Storage, } from '@reown/appkit-react-native';
import '@walletconnect/react-native-compat';
import { safeJsonParse, safeJsonStringify } from '@walletconnect/safe-json';
import { anvil } from './anvilNetwork';

const ethersAdapter = new EthersAdapter()
const projectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID || "";

const storage: Storage = {
  getKeys: async () => {
    return await AsyncStorage.getAllKeys() as string[];
  },
  getEntries: async <T = any>(): Promise<[string, T][]> => {
    const keys = await AsyncStorage.getAllKeys();
    return await Promise.all(keys.map(async key => [
      key,
      safeJsonParse(await AsyncStorage.getItem(key) ?? '') as T,
    ]));
  },
  setItem: async <T = any>(key: string, value: T) => {
    await AsyncStorage.setItem(key, safeJsonStringify(value));
  },
  getItem: async <T = any>(key: string): Promise<T | undefined> => {
    const item = await AsyncStorage.getItem(key);
    if (typeof item === 'undefined' || item === null) {
      return undefined;
    }

    return safeJsonParse(item) as T;
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};

export const appKit = createAppKit({
    projectId,
    networks: [anvil],
    defaultNetwork: anvil,  
    adapters: [ethersAdapter],
    storage,
    metadata: {
        name: 'My Awesome dApp',
        description: 'My dApp description',
        url: 'https://myapp.com',
        icons: ['https://myapp.com/icon.png'],
        redirect: {
            native: 'YOUR_APP_SCHEME://',
            universal: 'YOUR_APP_UNIVERSAL_LINK.com'
        }
    }
})

