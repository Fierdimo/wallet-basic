// src/services/blockchain/queries/tokenQueries.ts
import { EventLog, ethers } from "ethers";
import { tokenContract } from "../core/blockchain";

export interface TokenMetadata {
  name: string;
  symbol: string;
  formattedTotalSupply: string;
}

export interface TransferRecord {
  id: string;
  from: string;
  to: string;
  formattedValue: string;
  blockNumber: number;
  transactionHash: string;
}

// Los decimales no cambian nunca, así que los pedimos una sola vez
let decimalsPromise: Promise<number> | null = null;

const getDecimals = (): Promise<number> => {
  if (!decimalsPromise) {
    decimalsPromise = tokenContract.decimals().then(Number).catch((error: unknown) => {
      decimalsPromise = null;
      throw error;
    });
  }
  return decimalsPromise;
};

/**
 * Recupera de forma concurrente el nombre, símbolo y suministro total del ERC20
 */
export const fetchTokenMetadata = async (): Promise<TokenMetadata> => {
  try {
    const [name, symbol, totalSupply, decimals]: [string, string, bigint, number] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.totalSupply(),
      getDecimals(),
    ]);

    return {
      name,
      symbol,
      formattedTotalSupply: ethers.formatUnits(totalSupply, decimals),
    };
  } catch (error) {
    console.error("Error en fetchTokenMetadata:", error);
    throw new Error("No se pudieron cargar los metadatos del token.");
  }
};

/**
 * Consulta el balance actual de cualquier dirección EVM
 */
export const fetchAddressBalance = async (address: string): Promise<string> => {
  try {
    if (!ethers.isAddress(address)) {
      throw new Error("Dirección EVM inválida");
    }

    const [rawBalance, decimals]: [bigint, number] = await Promise.all([
      tokenContract.balanceOf(address),
      getDecimals(),
    ]);

    return ethers.formatUnits(rawBalance, decimals);
  } catch (error) {
    console.error(`Error en fetchAddressBalance para ${address}:`, error);
    throw error;
  }
};

/**
 * Consulta cuántos tokens de 'owner' puede gastar 'spender'
 */
export const fetchAllowance = async (owner: string, spender: string): Promise<string> => {
  if (!ethers.isAddress(owner) || !ethers.isAddress(spender)) {
    throw new Error("Dirección EVM inválida");
  }

  const [rawAllowance, decimals]: [bigint, number] = await Promise.all([
    tokenContract.allowance(owner, spender),
    getDecimals(),
  ]);

  return ethers.formatUnits(rawAllowance, decimals);
};

/**
 * Reconstruye el historial de movimientos de una dirección a partir de los eventos Transfer indexados.
 * Un 'from' igual a la dirección cero indica un mint.
 */
export const fetchTransferHistory = async (address: string): Promise<TransferRecord[]> => {
  const [sent, received, decimals] = await Promise.all([
    tokenContract.queryFilter(tokenContract.filters.Transfer(address, null)),
    tokenContract.queryFilter(tokenContract.filters.Transfer(null, address)),
    getDecimals(),
  ]);

  // Una transferencia a uno mismo aparece en ambas consultas: la deduplicamos por hash + índice del log
  const records = new Map<string, TransferRecord & { logIndex: number }>();
  for (const log of [...sent, ...received]) {
    if (!(log instanceof EventLog)) continue;

    const id = `${log.transactionHash}-${log.index}`;
    records.set(id, {
      id,
      from: log.args.from,
      to: log.args.to,
      formattedValue: ethers.formatUnits(log.args.value, decimals),
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
      logIndex: log.index,
    });
  }

  return [...records.values()]
    .sort((a, b) => b.blockNumber - a.blockNumber || b.logIndex - a.logIndex)
    .map(({ logIndex, ...record }) => record);
};

export interface TransferPayload {
  from: string;
  to: string;
  value: bigint;
}

/**
 * Escucha los eventos Transfer del contrato. Devuelve una función para desuscribirse.
 */
export const subscribeToTransfers = (onTransfer: (payload: TransferPayload) => void): (() => void) => {
  const listener = (from: string, to: string, value: bigint) => {
    onTransfer({ from, to, value });
  };

  tokenContract.on("Transfer", listener).catch((error) => {
    console.error("Error suscribiéndose a Transfer:", error);
  });

  return () => {
    tokenContract.off("Transfer", listener).catch(console.error);
  };
};
