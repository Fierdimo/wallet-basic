import { ethers } from "ethers";
import { StyleSheet, Text, View } from "react-native";

import { FormCard } from "@/components/token/form-controls";
import { shortenAddress } from "@/services/blockchain/core/accounts";
import { TransferRecord } from "@/services/blockchain/queries/tokenQueries";

interface TransferHistoryProps {
  address: string;
  symbol: string;
  records: TransferRecord[];
}

const describeRecord = (record: TransferRecord, address: string) => {
  const current = address.toLowerCase();
  if (record.from === ethers.ZeroAddress) {
    return { title: "Mint recibido", counterpart: "Tokens nuevos", sign: "+", color: "#10B981" };
  }
  if (record.from.toLowerCase() === current && record.to.toLowerCase() === current) {
    return { title: "Envío a ti mismo", counterpart: shortenAddress(record.to), sign: "", color: "#6B7280" };
  }
  if (record.from.toLowerCase() === current) {
    return { title: "Enviado", counterpart: `A ${shortenAddress(record.to)}`, sign: "−", color: "#EF4444" };
  }
  return { title: "Recibido", counterpart: `De ${shortenAddress(record.from)}`, sign: "+", color: "#10B981" };
};

export function TransferHistory({ address, symbol, records }: TransferHistoryProps) {
  return (
    <FormCard title="Historial de movimientos" description="Leído de los eventos Transfer del contrato.">
      {records.length === 0 && <Text style={styles.empty}>Esta cuenta todavía no tiene movimientos.</Text>}

      {records.map((record, index) => {
        const { title, counterpart, sign, color } = describeRecord(record, address);
        return (
          <View key={record.id} style={[styles.row, index > 0 && styles.rowBorder]}>
            <View style={styles.info}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.meta}>
                {counterpart} · Bloque {record.blockNumber}
              </Text>
            </View>
            <Text style={[styles.amount, { color }]}>
              {sign}
              {parseFloat(record.formattedValue).toLocaleString()} {symbol}
            </Text>
          </View>
        );
      })}
    </FormCard>
  );
}

const styles = StyleSheet.create({
  empty: { fontSize: 14, color: "#6B7280", paddingVertical: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: "#F3F4F6" },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600", color: "#111827" },
  meta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  amount: { fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"] },
});
