// src/hooks/useBlockchain.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { TestAccount } from "../services/blockchain/core/accounts";
import {
  executeTokenApprove,
  executeTokenMint,
  executeTokenTransfer,
  executeTokenTransferFrom,
  TransactionReceiptResult,
} from "../services/blockchain/mutations/tokenMutations";
import {
  fetchAddressBalance,
  fetchAllowance,
  fetchTokenMetadata,
  fetchTransferHistory,
  subscribeToTransfers,
  TokenMetadata,
  TransferRecord,
} from "../services/blockchain/queries/tokenQueries";

interface BlockchainState {
  metadata: TokenMetadata | null;
  balance: string;
  history: TransferRecord[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}

export interface MutationResult {
  success: boolean;
  error?: string;
}

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

export const useBlockchain = (account: TestAccount) => {
  const [state, setState] = useState<BlockchainState>({
    metadata: null,
    balance: "0",
    history: [],
    isLoading: true,
    isMutating: false,
    error: null,
  });

  // Evita que una carga lenta de la cuenta anterior pise los datos al cambiar de cuenta
  const activeAddressRef = useRef(account.address);

  /**
   * Carga paralela de los estados de lectura de la EVM
   */
  const loadBlockchainData = useCallback(async (address: string) => {
    try {
      const [metadata, balance, history] = await Promise.all([
        fetchTokenMetadata(),
        fetchAddressBalance(address),
        fetchTransferHistory(address),
      ]);

      if (activeAddressRef.current !== address) return;
      setState((prev) => ({ ...prev, metadata, balance, history, error: null }));
    } catch (err) {
      if (activeAddressRef.current !== address) return;
      setState((prev) => ({
        ...prev,
        error: getErrorMessage(err, "Error desconocido en la blockchain"),
      }));
    } finally {
      if (activeAddressRef.current === address) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  }, []);

  /**
   * Ejecuta una mutación y recarga balance, suministro e historial al confirmarse
   */
  const runMutation = useCallback(
    async (action: () => Promise<TransactionReceiptResult>): Promise<MutationResult> => {
      setState((prev) => ({ ...prev, isMutating: true, error: null }));
      try {
        const receipt = await action();
        console.log(`[UI Hook] Transacción confirmada en bloque: ${receipt.blockNumber}`);
        await loadBlockchainData(account.address);
        return { success: true };
      } catch (err) {
        const message = getErrorMessage(err, "Falló la transacción");
        setState((prev) => ({ ...prev, error: message }));
        return { success: false, error: message };
      } finally {
        setState((prev) => ({ ...prev, isMutating: false }));
      }
    },
    [account.address, loadBlockchainData]
  );

  const mintTokens = useCallback(
    (targetAddress: string, amount: string) => runMutation(() => executeTokenMint(targetAddress, amount)),
    [runMutation]
  );

  const transferTokens = useCallback(
    (targetAddress: string, amount: string) =>
      runMutation(() => executeTokenTransfer(account.privateKey, targetAddress, amount)),
    [account.privateKey, runMutation]
  );

  const approveSpender = useCallback(
    (spenderAddress: string, amount: string) =>
      runMutation(() => executeTokenApprove(account.privateKey, spenderAddress, amount)),
    [account.privateKey, runMutation]
  );

  const transferFromApproved = useCallback(
    (fromAddress: string, targetAddress: string, amount: string) =>
      runMutation(() => executeTokenTransferFrom(account.privateKey, fromAddress, targetAddress, amount)),
    [account.privateKey, runMutation]
  );

  // Efecto principal: carga inicial por cuenta y suscripción a eventos indexados
  useEffect(() => {
    const address = account.address;
    activeAddressRef.current = address;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    loadBlockchainData(address);

    // Respaldo para movimientos hechos fuera de la app (Remix, otra cuenta, etc.)
    const unsubscribe = subscribeToTransfers((payload) => {
      const currentWallet = address.toLowerCase();
      if (payload.to.toLowerCase() === currentWallet || payload.from.toLowerCase() === currentWallet) {
        console.log(`[Event Detected] Recargando datos por transferencia detectada.`);
        loadBlockchainData(address);
      }
    });

    return unsubscribe;
  }, [account.address, loadBlockchainData]);

  return {
    metadata: state.metadata,
    balance: state.balance,
    history: state.history,
    isLoading: state.isLoading,
    isMutating: state.isMutating,
    error: state.error,
    mintTokens,
    transferTokens,
    approveSpender,
    transferFromApproved,
    getAllowance: fetchAllowance,
    refetch: () => loadBlockchainData(account.address),
  };
};
