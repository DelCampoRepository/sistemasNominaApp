import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { inicioDiaCuliacanFecha, finDiaCuliacanFecha } from "../../../utils/obtenerHoraCuliacan";

export default function DetalleActividadEmpleadoCard({ item, formatFecha, realmInstance }) {
  const esPendiente = !(item.estado > 0);
  const esConfirmado = item.estado === 1;

  const colorAcento = esPendiente ? "#16a34a" : esConfirmado ? "#2563eb" : "#dc2626";
  const colorFondoSuave = esPendiente ? "#dcfce7" : esConfirmado ? "#dbeafe" : "#fee2e2";
  const etiquetaEstado = esPendiente ? "Capturado" : esConfirmado ? "Sincronizado" : "No sincronizado";

  // Para SCO, Avances/surcos guardados en EmpleadoCapturado son una "foto"
  // que solo se actualiza al presionar "Agregar avances"; si luego se borra
  // o corrige un aporte individual en el modal de surcos, esa foto queda
  // desactualizada. Para este reporte se recalcula en vivo desde la tabla
  // Surco, usando el mismo día que este registro (FechaCaptura).
  const esPorSurco = item.codUnidad?.trim() === "SCO";

  const surcosDelDia = esPorSurco && realmInstance
    ? Array.from(
        realmInstance.objects("Surco").filtered(
          "codEmpleado == $0 AND lote == $1 AND nave == $2 AND tabla == $3 AND actividad == $4 AND avance == $5 AND fecha >= $6 AND fecha <= $7",
          item.CodigoEmpleado,
          item.CodigoLote,
          item.CodigoNave,
          item.CodTabla,
          item.CodigoActividad,
          item.CodigoAvance,
          inicioDiaCuliacanFecha(item.FechaCaptura),
          finDiaCuliacanFecha(item.FechaCaptura)
        )
      )
    : null;

  const avanceMostrado = surcosDelDia
    ? surcosDelDia.reduce((acc, s) => acc + s.avanceAcum, 0)
    : item.Avances;

  const surcosMostrados = surcosDelDia
    ? surcosDelDia.map(s => Number(s.surco))
    : item.surcos;

  const renderSurco = ({ item: surco }) => (
    <View style={styles.surcoChip}>
      <Text style={styles.surcoChipTexto}>{surco}</Text>
    </View>
  );

  return (
    <View style={styles.Card}>
      <View style={styles.header}>
        <Text style={styles.tituloTexto} numberOfLines={1}>
          {item.CodigoActividad} - {item.CodigoAvance} {item.Descripcion}
        </Text>
      </View>

      <View style={[styles.badge, { backgroundColor: colorFondoSuave }]}>
        <View style={[styles.badgeDot, { backgroundColor: colorAcento }]} />
        <Text style={[styles.badgeTexto, { color: colorAcento }]}>{etiquetaEstado}</Text>
      </View>

      <View style={styles.metricasFila}>
        <View style={styles.metrica}>
          <Text style={styles.metricaLabel}>Fecha</Text>
          <Text style={styles.metricaValor}>{formatFecha(new Date(item.FechaCaptura).toISOString())}</Text>
        </View>
        <View style={styles.metrica}>
          <Text style={styles.metricaLabel}>Avance</Text>
          <Text style={styles.metricaValor}>{avanceMostrado.toFixed(2)}</Text>
        </View>
        <View style={styles.metrica}>
          <Text style={styles.metricaLabel}>Jornal</Text>
          <Text style={styles.metricaValor}>{(avanceMostrado / item.Rendimiento).toFixed(2)}</Text>
        </View>
        <View style={styles.metrica}>
          <Text style={styles.metricaLabel}>Unidad</Text>
          <Text style={styles.metricaValor}>{item.codUnidad}</Text>
        </View>
      </View>

      {surcosMostrados.length > 0 && (
        <View style={styles.surcosFila}>
          <Text style={styles.surcosLabel}>Surcos</Text>
          <FlatList
            data={surcosMostrados}
            renderItem={renderSurco}
            keyExtractor={(surco, index) => index.toString()}
            numColumns={8}
            scrollEnabled={false}
            contentContainerStyle={styles.surcosLista}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  Card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    marginHorizontal: "auto",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8
  },
  header: {
    marginBottom: 8
  },
  tituloTexto: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#111827"
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 5,
    marginBottom: 10
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  badgeTexto: {
    fontSize: 10,
    fontWeight: "700"
  },
  metricasFila: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metrica: {
    minWidth: "22%",
    flex: 1
  },
  metricaLabel: {
    fontSize: 10,
    color: "#9ca3af"
  },
  metricaValor: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2
  },
  surcosFila: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6"
  },
  surcosLabel: {
    fontSize: 10,
    color: "#9ca3af",
    marginBottom: 6
  },
  surcosLista: {
    justifyContent: "flex-start"
  },
  surcoChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    margin: 2
  },
  surcoChipTexto: {
    fontSize: 11,
    fontWeight: "700",
    color: "#16a34a"
  }
});
