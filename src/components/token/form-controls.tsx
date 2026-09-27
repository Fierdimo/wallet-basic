import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ANVIL_ACCOUNTS } from "@/services/blockchain/core/accounts";

export function FormCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {children}
    </View>
  );
}

interface AddressInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Dirección que no tiene sentido sugerir (normalmente la cuenta activa) */
  excludeAddress?: string;
}

/**
 * Campo de dirección con accesos rápidos a las cuentas de prueba de Anvil,
 * para no tener que escribir direcciones de 42 caracteres en el teléfono
 */
export function AddressInput({ label, value, onChange, excludeAddress }: AddressInputProps) {
  const suggestions = ANVIL_ACCOUNTS.filter(
    (account) => account.address.toLowerCase() !== excludeAddress?.toLowerCase()
  );

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder="0x..."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.suggestions}>
        {suggestions.map((account) => {
          const isSelected = account.address.toLowerCase() === value.toLowerCase();
          return (
            <Pressable
              key={account.address}
              onPress={() => onChange(account.address)}
              style={[styles.chip, isSelected && styles.chipSelected]}>
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{account.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function AmountInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 500"
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
      />
    </View>
  );
}

interface SubmitButtonProps {
  label: string;
  onPress: () => void;
  isBusy: boolean;
  variant?: "primary" | "secondary";
}

export function SubmitButton({ label, onPress, isBusy, variant = "primary" }: SubmitButtonProps) {
  const isSecondary = variant === "secondary";
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.buttonSecondary,
        isBusy && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      disabled={isBusy}>
      {isBusy ? (
        <ActivityIndicator size="small" color={isSecondary ? "#4F46E5" : "#FFFFFF"} />
      ) : (
        <Text style={[styles.buttonText, isSecondary && styles.buttonTextSecondary]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 4 },
  description: { fontSize: 13, color: "#6B7280", marginBottom: 16, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: "600", color: "#4B5563", marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "#EEF2FF" },
  chipSelected: { backgroundColor: "#4F46E5" },
  chipText: { fontSize: 12, fontWeight: "600", color: "#4F46E5" },
  chipTextSelected: { color: "#FFFFFF" },
  button: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  buttonSecondary: { backgroundColor: "#EEF2FF", marginTop: 10 },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  buttonTextSecondary: { color: "#4F46E5" },
});
