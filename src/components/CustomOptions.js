import React from 'react'
import { View, Alert, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ObtenerEmpleadosDiaAnteriorRealm } from '../../useCases/DuplicarEmpleadosDiaAnterior';

export default function CustomOptions({ visible = true, setModales, realmInstance }) {
  const { width } = useWindowDimensions();
  const navigator = useNavigation();

  const esTablet = width > 600;
  const iconSize = esTablet ? 26 : 20;
  const circuloSize = esTablet ? 56 : 44;

  const confirmarCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          onPress: () => {
            navigator.navigate('Login');
          },
          style: 'destructive',
        },
      ],
    );
  };

  const BotonOpcion = ({ icono, colorIcono, colorFondo, onPress }) => (
    <TouchableOpacity
      style={[
        styles.boton,
        { width: circuloSize, height: circuloSize, borderRadius: circuloSize / 2, backgroundColor: colorFondo }
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Ionicons name={icono} size={iconSize} color={colorIcono} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.contenedorFlotante} pointerEvents="box-none">
      <View style={styles.pill}>
        <BotonOpcion
          icono="arrow-back"
          colorIcono="#6b7280"
          colorFondo="#f3f4f6"
          onPress={() => navigator.goBack()}
        />

        {visible && (
          <BotonOpcion
            icono="person-add"
            colorIcono="#16a34a"
            colorFondo="#dcfce7"
            onPress={() => {
              setModales(prev => ({
                ...prev,
                modalEmpleados: true
              }));
            }}
          />
        )}

        {visible && (
          <BotonOpcion
            icono="duplicate-outline"
            colorIcono="#2563eb"
            colorFondo="#dbeafe"
            onPress={() => {
              ObtenerEmpleadosDiaAnteriorRealm(realmInstance);
            }}
          />
        )}

        <BotonOpcion
          icono="exit"
          colorIcono="#dc2626"
          colorFondo="#fee2e2"
          onPress={confirmarCerrarSesion}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorFlotante: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'white',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8
  },
  boton: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
