// src/app/token.tsx
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccountSelector } from "@/components/token/account-selector";
import { ApproveForm, MintForm, TransferForm, TransferFromForm } from "@/components/token/action-forms";
import { TransferHistory } from "@/components/token/transfer-history";
import { useBlockchain } from "@/hooks/useBlockchain";
import { ANVIL_ACCOUNTS, shortenAddress, TestAccount } from "@/services/blockchain/core/accounts";
import { AppKitButton } from "@reown/appkit-react-native";

type ActionKey = "transfer" | "approve" | "transferFrom" | "mint";

const ACTIONS: { key: ActionKey; label: string }[] = [
  { key: "transfer", label: "Enviar" },
  { key: "approve", label: "Autorizar" },
  { key: "transferFrom", label: "Gastar" },
  { key: "mint", label: "Mint" },
];

export default function TokenDashboardScreen() {
  // Arrancamos con la Cuenta #1 como "usuario logueado"; la #0 es el owner del contrato
  const [account, setAccount] = useState<TestAccount>(ANVIL_ACCOUNTS[1]);
  const [activeAction, setActiveAction] = useState<ActionKey>("transfer");

  const {
    metadata,
    balance,
    history,
    isLoading,
    isMutating,
    error,
    mintTokens,
    transferTokens,
    approveSpender,
    transferFromApproved,
    getAllowance,
  } = useBlockchain(account);

  // Pantalla completa de carga solo la primera vez; al cambiar de cuenta se mantiene el contenido
  if (isLoading && !metadata) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Conectando con la EVM de tu Mac...</Text>
      </View>
    );
  }

  const symbol = metadata?.symbol ?? "MTK";
  const formProps = { accountAddress: account.address, symbol, isMutating };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionLabel}>Cuenta activa</Text>
          <AccountSelector selected={account} onSelect={setAccount} />

          {/* TARJETA DE BALANCE */}
          <View style={styles.card}>
            <Text style={styles.tokenSymbol}>{symbol}</Text>
            {isLoading ? (
              <ActivityIndicator style={styles.balanceLoader} color="#FFFFFF" />
            ) : (
              <Text style={styles.balanceValue}>{parseFloat(balance).toFixed(2)}</Text>
            )}
            <Text style={styles.tokenName}>
              {metadata?.name ?? "Cargando Token..."} · {shortenAddress(account.address)}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.totalSupply}>
              Suministro Total: {parseFloat(metadata?.formattedTotalSupply ?? "0").toLocaleString()} {symbol}
            </Text>
            <AppKitButton />
          </View>

          {/* MENSAJE DE ERROR GLOBAL (SI EXISTE) */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* SELECTOR DE ACCIÓN */}
          <View style={styles.segmented}>
            {ACTIONS.map(({ key, label }) => (
              <Pressable
                key={key}
                onPress={() => setActiveAction(key)}
                style={[styles.segment, activeAction === key && styles.segmentActive]}>
                <Text style={[styles.segmentText, activeAction === key && styles.segmentTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {/* La key reinicia los formularios al cambiar de cuenta */}
          <View key={account.address}>
            {activeAction === "transfer" && <TransferForm {...formProps} onTransfer={transferTokens} />}
            {activeAction === "approve" && (
              <ApproveForm {...formProps} onApprove={approveSpender} getAllowance={getAllowance} />
            )}
            {activeAction === "transferFrom" && (
              <TransferFromForm {...formProps} onTransferFrom={transferFromApproved} />
            )}
            {activeAction === "mint" && <MintForm {...formProps} onMint={mintTokens} />}
          </View>

          <TransferHistory address={account.address} symbol={symbol} records={history} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F3F4F6" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#4B5563", fontWeight: "500" },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#6B7280", marginBottom: 8, letterSpacing: 0.5 },

  // Estilos de la Tarjeta de Balance
  card: {
    backgroundColor: "#4F46E5",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  tokenSymbol: { color: "#E0E7FF", fontSize: 14, fontWeight: "700", letterSpacing: 1 },
  balanceValue: { color: "#FFFFFF", fontSize: 42, fontWeight: "800", marginVertical: 8 },
  balanceLoader: { height: 50, marginVertical: 8 },
  tokenName: { color: "#FFFFFF", fontSize: 16, fontWeight: "500", opacity: 0.9 },
  divider: { height: 1, backgroundColor: "rgba(255, 255, 255, 0.2)", width: "100%", marginVertical: 16 },
  totalSupply: { color: "#E0E7FF", fontSize: 12, fontWeight: "500" },

  // Banner de error
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: { color: "#B91C1C", fontSize: 13, fontWeight: "500" },

  // Selector de acción
  segmented: { flexDirection: "row", backgroundColor: "#E5E7EB", borderRadius: 10, padding: 4, marginBottom: 16 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  segmentActive: { backgroundColor: "#FFFFFF" },
  segmentText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  segmentTextActive: { color: "#111827" },
});
