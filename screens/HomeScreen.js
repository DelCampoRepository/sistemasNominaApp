import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import lista from '../assets/lista.png';
import { useNavigation } from '@react-navigation/native';
import localStorage from '../utils/localStorage';
import reportes from '../assets/reportes.png';
import cargar from '../assets/cargar.png';
import porEmpleado from '../assets/inmigracion.png'
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
export default function HomeScreen()
 {
        console.log(new Date())
    const navigation = useNavigation();
    const [nombreUsuario, setNombreUsuario] = useState('');
 const [estadoSinc, setEstadoSinc] = useState(false);
    useEffect(() => {
        cargarNombreUsuario();
    }, []);

     useEffect(() =>{
    
  },[realmInstance])

    useFocusEffect(
      useCallback(
        () => {
            try{
            if(realmInstance !== null)
                {
                  const sync = realmInstance.objectForPrimaryKey("Sincronizar", 0);
                
                  const estaSincronizado = sync?.sincronizado ?? false;
                  console.log(estaSincronizado,'el estado')
                  setEstadoSinc(estaSincronizado);
                }
            }catch(error){
              
        
            }
        },
        [realmInstance]
      )
    );
  
    const getUserData = async () => {
        const userData = await localStorage.get("USER_DATA");
        return userData ? JSON.parse(userData) : null;


    };

    const handleSincronizar = () =>{
        navigation.navigate("Loading");
    }

    const cargarNombreUsuario = async () => {
        const userData = await getUserData();
        if (userData?.Nombre) {

            const nombreFormateado = userData.Nombre
                .toLowerCase()
                .split(' ')
                .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                .join(' ');
            setNombreUsuario(nombreFormateado);
        }
    };
  const GenerarFecha = () => {
    //   console.log(limiteMaximoCaptura, "limiteMaximoCaptura");
    const ahora = new Date();

    //if (horaExtra) ahora.setHours(ahora.() + limiteMaximoCaptura);
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");

    let fechaFormateada = `${dia}/${mes}/${año}`;
    return fechaFormateada;
  };
    const confirmarCerrarSesion = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    onPress: () => {
                        navigation.navigate('Login');
                    },
                    style: 'destructive',
                },
            ],
        );
    };

    return (
      <SafeAreaView style={{ backgroundColor: "red",
    flex: 1,}}>
          <View style={styles.container}>
            <View style={{ padding: 10 }}>
                <View style={styles.headerContainer}>
                    <View style={styles.tituloContainer}>
                        <Text style={styles.bienvenidoText}>Bienvenido</Text>
                        {nombreUsuario !== '' && (
                            <Text style={styles.nombreUsuarioText}>{nombreUsuario}</Text>
                        )}
                         <Text style={styles.fecha}>{GenerarFecha()}</Text>
                    </View>

                    <View style={styles.logoutContainer}>
                        <TouchableOpacity onPress={confirmarCerrarSesion}>
                            <Image source={require('../assets/cerrars.png')}
                                style={{ width:50, height: 48 }}
                                resizeMode='contain' />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.logoCenter}>
                    <Image source={require('../assets/logo.png')}
                        style={[styles.logoImage, {
                            elevation: 15,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84
                        }]}
                        resizeMode='contain' />
                </View>
            </View>

            <View style={styles.containerView}>
               
                <View style={{display:"flex",alignItems:"center", justifyContent:'center', flexDirection:'row', backgroundColor:'',width:'100%',height:"50%"}}>
                    <TouchableOpacity onPress={() => navigation.navigate('Actividades')} style={styles.card}>
                        <View >
                            <View style={styles.cardContent}>
                                <View style={{width:"100%",height:'80%', alignItems:'center', justifyContent:"center", display:'flex'}}>
                                    <Image source={lista} resizeMode='contain'
                                    style={{ width:"90%", height: "90%",left:10 }} />
                                </View>
                                <View style={{width:"100%",height:'20%',alignItems:'center', justifyContent:'center',display:'flex'}}>
                                    <Text style={{ color: "grey", fontWeight: "bold",  marginBottom:5}}>
                                    Captura por Activ.
                                </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Reportes')} style={styles.card}>
                        
                            <View style={styles.cardContent}>
                                <View style={{width:"100%",height:'80%', alignItems:'center', justifyContent:"center", display:'flex'}}>
                                    <Image source={reportes} resizeMode='contain'
                                    style={{ width:"90%", height: "90%",left:10 }} />
                                </View>
                                <View style={{width:"100%",height:'20%',alignItems:'center', justifyContent:'center',display:'flex'}}>
                                    <Text style={{ color: "grey", fontWeight: "bold",  marginBottom:5}}>
                                   Reportes
                                </Text>
                                </View>
                            </View>
                    
                    </TouchableOpacity>
                </View>

                  <View style={{ width:'100%',height:'50%', display:"flex",flexDirection:'row', justifyContent:'center'}}>
                     
                      <TouchableOpacity style={styles.cardPequeño} onPress={() =>navigation.navigate('ListaEmpleados')}>
                        <View style={styles.cardContent}>
                     
                                <View style={{width:"100%",height:'80%', alignItems:'center', justifyContent:"center", display:'flex'}}>
                                    <Image source={porEmpleado} resizeMode='contain'
                                    style={{ width:"90%", height: "90%" }} />
                                </View>
                                <View style={{width:"100%",height:'20%',alignItems:'center', justifyContent:'center',display:'flex'}}>
                                    <Text style={{ color: "grey", fontWeight: "bold",  marginBottom:5}}>
                                   Actividades por empleado
                                </Text>
                                </View>
                            </View>
                    </TouchableOpacity>
                      <TouchableOpacity style={styles.cardPequeño} onPress={handleSincronizar}>
                        <View style={styles.cardContent}>
                            {estadoSinc &&
                            <Image
                                source={require("../assets/sync-circle.png")}
                                style={styles.checkIcon}
                            />
        }
                                <View style={{width:"100%",height:'80%', alignItems:'center', justifyContent:"center", display:'flex'}}>
                                    <Image source={cargar} resizeMode='contain'
                                    style={{ width:"90%", height: "90%" }} />
                                </View>
                                <View style={{width:"100%",height:'20%',alignItems:'center', justifyContent:'center',display:'flex'}}>
                                    <Text style={{ color: "grey", fontWeight: "bold",  marginBottom:5}}>
                                   Sincronizar
                                </Text>
                                </View>
                            </View>
                    </TouchableOpacity>
                    
                  </View>
             
            </View>
        </View>
      </SafeAreaView>
    );
 
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0fff0',
        width: '100%',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    tituloContainer: {
        justifyContent: "space-between",
        flexDirection: "column",
        padding: 10,
        borderRadius: 10,
        margin: 10
    },
    bienvenidoText: {
        fontSize: 25,
        fontWeight: 'bold',
        color: "grey"
    },
     checkIcon: {
    width: 30,
    height: 30,
    position: "absolute",
    top: -8,
    right: -5,
    
  },
    fecha: {
        fontSize: 16,
        fontWeight: 'bold',
        color: "grey",
        marginTop: 5,
        paddingLeft:2
    },
    nombreUsuarioText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: "grey",
        marginTop: 5
    },
    logoutContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        margin: 15,
        elevation: 5
    },
    logoCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 35,
    },
    logoImage: {
        width: 200,
        height: 200
    },
    containerView: {
        flex: 1,
       
        padding: 0,
        marginBottom: 10,
        marginTop: 10,
     
    },
    botonesContainer: {
       
     
    },
    card: {
        width: "30%",
        height:"50%",
        backgroundColor: 'white',
        margin:20,
        borderRadius: 20,
        elevation: 5,
       
      
    },
    cardGrande: {
        
        width: "30%",
        backgroundColor: 'white',
       
       
        borderRadius: 25,
      
        elevation: 5,
        alignItems: 'center',
        
    },
    cardPequeño: {
      width: "30%",
      height:"50%",
      backgroundColor: 'white',
        margin:20,
      borderRadius: 20,
        elevation: 5,
       
    },
    cardContent: {
        flexDirection: 'column',
        
       
        
    },
     cardContentSinc: {
       
    }
});

