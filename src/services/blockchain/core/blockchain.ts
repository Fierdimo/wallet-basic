// src/services/blockchain/core/blockchain.ts
import { Contract, ethers, JsonRpcProvider } from "ethers";

const ANVIL_RPC_URL = `http://${process.env.EXPO_PUBLIC_ANVIL_RPC_URL}:8545`;

// ⚠️ REEMPLAZA CON LA DIRECCIÓN QUE TE DIO REMIX AL HACER DEPLOY
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Human-Readable ABI: Declaramos exactamente lo que expone tu contrato en Solidity
const TOKEN_ABI: string[] = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount) external",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  // Errores custom de OpenZeppelin: declararlos permite a ethers decodificar el motivo del revert
  "error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)",
  "error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)",
  "error ERC20InvalidReceiver(address receiver)",
  "error OwnableUnauthorizedAccount(address account)",
  // Errores propios de MiToken, usados en los require de mint()
  "error ceroAddress()",
  "error depositCero()"
];

// Instancias globales exportables
// cacheTimeout -1: sin esto ethers reutiliza por 250ms respuestas idénticas (como el nonce) y dos
// transacciones seguidas de la misma cuenta fallan con "nonce has already been used".
// pollingInterval 1000: Anvil es local, así que podemos detectar eventos más rápido que el default (4s).
export const provider: JsonRpcProvider = new ethers.JsonRpcProvider(ANVIL_RPC_URL, undefined, {
  cacheTimeout: -1,
  pollingInterval: 1000,
});
export const tokenContract: Contract = new ethers.Contract(CONTRACT_ADDRESS, TOKEN_ABI, provider);
