import React from 'react'
import { View, Alert, StyleSheet,TouchableOpacity } from 'react-native';
import {  useWindowDimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ObtenerEmpleadosDiaAnteriorRealm } from '../../useCases/DuplicarEmpleadosDiaAnterior';

export default function CustomOptions({ visible = true, setModales, realmInstance}) {
  const { width } = useWindowDimensions();
   const navigator = useNavigation(); 

   const   iconSize = width > 600 ? 45 : 30; // Ajusta el tamaño del ícono según el ancho de la pantalla
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

styles.container
  return (
    
    <View  style={[styles.container,{width: width >600 ? 350:250, height: width > 600 ? 70:50}]}>
     <TouchableOpacity
             style={[styles.botonAgregar,{}]}
             onPress={() => {
                navigator.goBack();
             }}
      >
             <Ionicons name="arrow-back" size={iconSize} color="#959595" />
           </TouchableOpacity>
           
        {visible &&
           <TouchableOpacity
             style={[styles.botonAgregar,{width:width > 600 ? 60:45,}]}
             onPress={() => {
                 setModales(prev => ({
            ...prev,
            modalEmpleados: true
          }));
             }}
           >
             <Ionicons name="person-add" size={iconSize} color="#959595" />
           </TouchableOpacity>
           
        }
        {visible &&
           <TouchableOpacity
             style={[styles.botonAgregar,{width:width > 600 ? 60:45,}]}
             onPress={() => {
              console.log("boton");
              ObtenerEmpleadosDiaAnteriorRealm(realmInstance);
             }}
           >
             <Ionicons name="duplicate-outline" size={iconSize} color="#959595" />
           </TouchableOpacity>
        }
           <TouchableOpacity
             style={[styles.botonAgregar,{}]}
             onPress={() => {
               confirmarCerrarSesion();
             }}
           >
             <Ionicons name="exit" size={iconSize} color="#959595" />
           </TouchableOpacity>
    </View>
  )
 
}

const styles = StyleSheet.create({

  container:{
    
   
    backgroundColor:"white",
    bottom: 5,
    position: 'absolute',
    elevation:5,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
  
    zIndex: -1
  }, 
  botonAgregar: {
   
   
    borderRadius: "50%",
    
    height:"90%",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginVertical:"auto"
  }
});