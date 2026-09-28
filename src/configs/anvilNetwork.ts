import { type AppKitNetwork, } from '@reown/appkit-react-native';

export const anvil: AppKitNetwork = {
    id: 31337,
    name: 'Anvil Local',
    nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: [`http://${process.env.EXPO_PUBLIC_ANVIL_RPC_URL}:8545`],
        },
    },
    chainNamespace: 'eip155',
    caipNetworkId: 'eip155:31337',
    testnet: true,
};