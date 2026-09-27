import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";

import { AddressInput, AmountInput, FormCard, SubmitButton } from "@/components/token/form-controls";
import { MutationResult } from "@/hooks/useBlockchain";
import { shortenAddress } from "@/services/blockchain/core/accounts";

interface BaseFormProps {
  accountAddress: string;
  symbol: string;
  isMutating: boolean;
}

/**
 * Muestra el resultado de la transacción y devuelve si hay que limpiar el formulario
 */
const reportResult = (result: MutationResult, successMessage: string): boolean => {
  if (result.success) {
    Alert.alert("¡Éxito!", successMessage);
    return true;
  }
  Alert.alert("Error en la transacción", result.error ?? "No se pudo procesar la transacción.");
  return false;
};

const hasEmptyFields = (...values: string[]) => {
  if (values.some((value) => value.trim() === "")) {
    Alert.alert("Campos incompletos", "Por favor rellena todos los campos.");
    return true;
  }
  return false;
};

export function TransferForm({
  accountAddress,
  symbol,
  isMutating,
  onTransfer,
}: BaseFormProps & { onTransfer: (to: string, amount: string) => Promise<MutationResult> }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async () => {
    if (hasEmptyFields(to, amount)) return;
    const result = await onTransfer(to, amount);
    if (reportResult(result, `Enviaste ${amount} ${symbol} a ${shortenAddress(to)}.`)) {
      setTo("");
      setAmount("");
    }
  };

  return (
    <FormCard title="Enviar tokens" description="Mueve tokens desde tu cuenta activa. Tu balance baja y el del destino sube.">
      <AddressInput label="Dirección de destino" value={to} onChange={setTo} excludeAddress={accountAddress} />
      <AmountInput label="Cantidad a enviar" value={amount} onChange={setAmount} />
      <SubmitButton label="Enviar" onPress={handleSubmit} isBusy={isMutating} />
    </FormCard>
  );
}

export function ApproveForm({
  accountAddress,
  symbol,
  isMutating,
  onApprove,
  getAllowance,
}: BaseFormProps & {
  onApprove: (spender: string, amount: string) => Promise<MutationResult>;
  getAllowance: (owner: string, spender: string) => Promise<string>;
}) {
  const [spender, setSpender] = useState("");
  const [amount, setAmount] = useState("");
  const [allowance, setAllowance] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSpenderChange = (value: string) => {
    setSpender(value);
    setAllowance(null);
  };

  const refreshAllowance = async (target: string) => {
    setIsChecking(true);
    try {
      setAllowance(await getAllowance(accountAddress, target));
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "No se pudo consultar la autorización.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheck = () => {
    if (hasEmptyFields(spender)) return;
    refreshAllowance(spender);
  };

  const handleApprove = async () => {
    if (hasEmptyFields(spender, amount)) return;
    const result = await onApprove(spender, amount);
    const message =
      Number(amount) === 0
        ? `Revocaste el permiso de ${shortenAddress(spender)}.`
        : `${shortenAddress(spender)} ahora puede gastar hasta ${amount} ${symbol} de tu cuenta.`;
    if (reportResult(result, message)) {
      setAmount("");
      refreshAllowance(spender);
    }
  };

  return (
    <FormCard
      title="Autorizar gasto (approve)"
      description="Permite que otra dirección gaste tokens de tu cuenta, hasta un límite. Así funcionan los exchanges. Usa 0 para revocar.">
      <AddressInput label="Dirección autorizada" value={spender} onChange={handleSpenderChange} excludeAddress={accountAddress} />
      <AmountInput label="Límite autorizado" value={amount} onChange={setAmount} />
      {allowance !== null && (
        <Text style={styles.result}>
          Autorización actual: {parseFloat(allowance).toLocaleString()} {symbol}
        </Text>
      )}
      <SubmitButton label="Autorizar" onPress={handleApprove} isBusy={isMutating} />
      <SubmitButton label="Consultar autorización actual" onPress={handleCheck} isBusy={isChecking} variant="secondary" />
    </FormCard>
  );
}

export function TransferFromForm({
  accountAddress,
  symbol,
  isMutating,
  onTransferFrom,
}: BaseFormProps & { onTransferFrom: (from: string, to: string, amount: string) => Promise<MutationResult> }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = async () => {
    if (hasEmptyFields(from, to, amount)) return;
    const result = await onTransferFrom(from, to, amount);
    if (reportResult(result, `Moviste ${amount} ${symbol} de ${shortenAddress(from)} a ${shortenAddress(to)}.`)) {
      setAmount("");
    }
  };

  return (
    <FormCard
      title="Gastar tokens autorizados"
      description="Tu cuenta activa mueve tokens de otra cuenta que antes te autorizó con approve (transferFrom).">
      <AddressInput label="Cuenta que te autorizó" value={from} onChange={setFrom} excludeAddress={accountAddress} />
      <AddressInput label="Dirección de destino" value={to} onChange={setTo} />
      <AmountInput label="Cantidad" value={amount} onChange={setAmount} />
      <SubmitButton label="Gastar autorizado" onPress={handleSubmit} isBusy={isMutating} />
    </FormCard>
  );
}

export function MintForm({
  accountAddress,
  symbol,
  isMutating,
  onMint,
}: BaseFormProps & { onMint: (to: string, amount: string) => Promise<MutationResult> }) {
  const [to, setTo] = useState(accountAddress);
  const [amount, setAmount] = useState("");

  const handleSubmit = async () => {
    if (hasEmptyFields(to, amount)) return;
    const result = await onMint(to, amount);
    if (reportResult(result, `Se crearon ${amount} ${symbol} nuevos para ${shortenAddress(to)}.`)) {
      setAmount("");
    }
  };

  return (
    <FormCard
      title="Crear tokens (mint)"
      description="Solo el owner del contrato puede hacerlo, así que siempre firma la Cuenta #0. Crea tokens nuevos: el suministro total sube.">
      <AddressInput label="Dirección que recibe" value={to} onChange={setTo} />
      <AmountInput label="Cantidad a crear" value={amount} onChange={setAmount} />
      <SubmitButton label="Ejecutar mint" onPress={handleSubmit} isBusy={isMutating} />
    </FormCard>
  );
}

const styles = StyleSheet.create({
  result: { fontSize: 13, fontWeight: "600", color: "#4F46E5", marginTop: 12 },
});
