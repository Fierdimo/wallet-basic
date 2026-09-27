// src/services/blockchain/core/accounts.ts

// ⚠️ SOLO PARA DESARROLLO: son las cuentas públicas de prueba que Anvil genera con su mnemonic por defecto.
// En una app real las llaves nunca viven en el código; firma la wallet del usuario (ej: WalletConnect).
export interface TestAccount {
  label: string;
  address: string;
  privateKey: string;
}

export const ANVIL_ACCOUNTS: TestAccount[] = [
  {
    label: "Cuenta #0",
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  },
  {
    label: "Cuenta #1",
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  },
  {
    label: "Cuenta #2",
    address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  },
  {
    label: "Cuenta #3",
    address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  },
];

// La cuenta #0 es el initialOwner con el que se desplegó el contrato en Remix
export const OWNER_ACCOUNT = ANVIL_ACCOUNTS[0];

export const shortenAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;
