// src/services/blockchain/mutations/tokenMutations.ts
import { Contract, ContractTransactionResponse, ethers } from "ethers";
import { OWNER_ACCOUNT } from "../core/accounts";
import { provider, tokenContract } from "../core/blockchain";

export interface TransactionReceiptResult {
  transactionHash: string;
  blockNumber: number;
}

const TOKEN_DECIMALS = 18;

/**
 * Vincula el contrato a un firmante local para poder mandar transacciones de escritura
 */
const getSignedContract = (privateKey: string): Contract =>
  tokenContract.connect(new ethers.Wallet(privateKey, provider)) as Contract;

const assertAddress = (address: string, label: string) => {
  if (!ethers.isAddress(address)) throw new Error(`${label} inválida`);
};

/**
 * Valida y convierte el monto legible (ej: "250") a las unidades de la EVM (18 decimales)
 */
const parseAmount = (amount: string, { allowZero = false } = {}): bigint => {
  const value = Number(amount);
  if (amount.trim() === "" || isNaN(value) || value < 0 || (!allowZero && value === 0)) {
    throw new Error("Monto inválido");
  }
  return ethers.parseUnits(amount, TOKEN_DECIMALS);
};

/**
 * Espera a que Anvil mine el bloque y valida que la transacción no haya sido revertida
 */
const waitForReceipt = async (tx: ContractTransactionResponse): Promise<TransactionReceiptResult> => {
  const receipt = await tx.wait();
  if (!receipt || receipt.status === 0) {
    throw new Error("La transacción fue revertida por la EVM");
  }
  return { transactionHash: receipt.hash, blockNumber: receipt.blockNumber };
};

/**
 * Obtiene el nombre del error custom del revert. Cuando el revert ocurre al estimar gas desde el Wallet,
 * ethers no llena 'error.revert', así que lo decodificamos con el ABI a partir de 'error.data'
 */
const getRevertName = (error: any): string | undefined => {
  if (error?.revert?.name) return error.revert.name;
  if (typeof error?.data !== "string") return undefined;
  try {
    return tokenContract.interface.parseError(error.data)?.name;
  } catch {
    return undefined;
  }
};

/**
 * Traduce los errores custom de OpenZeppelin a mensajes legibles
 */
const toReadableError = (error: any): Error => {
  console.warn('desde readable', typeof error, error)
  switch (getRevertName(error)) {
    case "ERC20InsufficientBalance":
      return new Error("Saldo insuficiente para esta operación.");
    case "ERC20InsufficientAllowance":
      return new Error("La autorización (allowance) no alcanza para este monto.");
    case "ERC20InvalidReceiver":
      return new Error("La dirección de destino no puede recibir tokens.");
    case "OwnableUnauthorizedAccount":
      return new Error("Transacción revertida: esta cuenta no es dueña del contrato.");
    case "ceroAddress":
      return new Error("No se puede mintear a la dirección cero (0x000...000).");
    case "depositCero":
      return new Error("El monto a mintear debe ser mayor a 0.");
  }
  if (error?.shortMessage) return new Error(error.shortMessage);
  return error instanceof Error ? error : new Error(String(error));
};

/**
 * Crea tokens nuevos. Siempre firma la cuenta owner del contrato (modificador 'onlyOwner')
 */
export const executeTokenMint = async (targetAddress: string, amount: string): Promise<TransactionReceiptResult> => {
  try {
    assertAddress(targetAddress, "Dirección de destino");
    const tx = await getSignedContract(OWNER_ACCOUNT.privateKey).mint(targetAddress, parseAmount(amount));
    return await waitForReceipt(tx);
  } catch (error) {
    throw toReadableError(error);
  }
};

/**
 * Envía tokens desde la cuenta firmante hacia la dirección de destino
 */
export const executeTokenTransfer = async (
  signerPrivateKey: string,
  targetAddress: string,
  amount: string
): Promise<TransactionReceiptResult> => {
  try {
    assertAddress(targetAddress, "Dirección de destino");
    const tx = await getSignedContract(signerPrivateKey).transfer(targetAddress, parseAmount(amount));
    return await waitForReceipt(tx);
  } catch (error) {
    throw toReadableError(error);
  }
};

/**
 * Autoriza a 'spender' a gastar hasta 'amount' tokens de la cuenta firmante. Un monto 0 revoca el permiso
 */
export const executeTokenApprove = async (
  signerPrivateKey: string,
  spenderAddress: string,
  amount: string
): Promise<TransactionReceiptResult> => {
  try {
    assertAddress(spenderAddress, "Dirección autorizada");
    const tx = await getSignedContract(signerPrivateKey).approve(spenderAddress, parseAmount(amount, { allowZero: true }));
    return await waitForReceipt(tx);
  } catch (error) {
    throw toReadableError(error);
  }
};

/**
 * La cuenta firmante gasta tokens de 'fromAddress' usando la autorización (allowance) que ésta le dio
 */
export const executeTokenTransferFrom = async (
  signerPrivateKey: string,
  fromAddress: string,
  targetAddress: string,
  amount: string
): Promise<TransactionReceiptResult> => {
  try {
    assertAddress(fromAddress, "Dirección de origen");
    assertAddress(targetAddress, "Dirección de destino");
    const tx = await getSignedContract(signerPrivateKey).transferFrom(fromAddress, targetAddress, parseAmount(amount));
    return await waitForReceipt(tx);
  } catch (error) {
    throw toReadableError(error);
  }
};
