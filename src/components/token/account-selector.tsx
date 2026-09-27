import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { ANVIL_ACCOUNTS, OWNER_ACCOUNT, shortenAddress, TestAccount } from "@/services/blockchain/core/accounts";

interface AccountSelectorProps {
  selected: TestAccount;
  onSelect: (account: TestAccount) => void;
}

/**
 * Simula el "login" eligiendo con qué cuenta de prueba de Anvil se firma y se consulta
 */
export function AccountSelector({ selected, onSelect }: AccountSelectorProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {ANVIL_ACCOUNTS.map((account) => {
        const isSelected = account.address === selected.address;
        return (
          <Pressable
            key={account.address}
            onPress={() => onSelect(account)}
            style={[styles.chip, isSelected && styles.chipSelected]}>
            <Text style={[styles.label, isSelected && styles.textSelected]}>
              {account.label}
              {account.address === OWNER_ACCOUNT.address ? " · Owner" : ""}
            </Text>
            <Text style={[styles.address, isSelected && styles.textSelected]}>{shortenAddress(account.address)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipSelected: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  label: { fontSize: 13, fontWeight: "700", color: "#111827" },
  address: { fontSize: 11, color: "#6B7280", marginTop: 2 },
  textSelected: { color: "#FFFFFF" },
});
