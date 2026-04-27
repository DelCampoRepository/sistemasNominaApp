import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import reportes from '../assets/reportes.png';
import cargar from '../assets/cargar.png';
import porEmpleado from '../assets/inmigracion.png'
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {  useWindowDimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
export default function HomeScreen()
 {
   
    const navigation = useNavigation();
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [estadoSinc, setEstadoSinc] = useState(false);
   
    const { width, height } = useWindowDimensions();
    
    useEffect(
        () => {
        cargarNombreUsuario();
        
    }, []);

    useFocusEffect(
      useCallback(
        () => {
            try{
               
            if(realmInstance !== null)
                {
                  const sync = realmInstance.objectForPrimaryKey("Sincronizar", 0);
                
                  const estaSincronizado = sync?.sincronizado ?? false;
                 
                  setEstadoSinc(estaSincronizado);
                }
            }catch(error){
              

            }
        },
        [realmInstance]
      )
    );
  
    const getUserData = async () => {
        const result = realmInstance.objects("UserData")[0];
        return result;

    };

    const handleSincronizar = () =>{
        navigation.navigate("Loading");
    }

    const cargarNombreUsuario = async () => {
        const userData = await getUserData();
        
        if (userData?.nombre) {

            const nombreFormateado = userData.nombre
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
                <Text style={styles.headerText}>Bienvenido</Text> 
                {
                    nombreUsuario !== '' && (<Text style={styles.simpleText}>{nombreUsuario}</Text>)
                }
                
                <Text style={styles.simpleText}>{GenerarFecha()}</Text>
                
                {/*Icono Salir */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity onPress={confirmarCerrarSesion}>
                        <Image 
                            source={require('../assets/cerrars.png')}
                            style={{ width:50, height: 48 }}
                            resizeMode='contain' 
                        />
                    </TouchableOpacity>
                </View>

                
        </View>
        <View>
            <View style={styles.logoContainer}>
                <Image 
                    source={require('../assets/logo.png')}
                    style={{width: width >600 ? '40%' : '30%', height: height > 600 ? '80%' : '60%'}}
                    resizeMode='contain' 
                />
            </View>
                    
                
        </View>
        <View style={[styles.buttonContainer,{marginTop: width > 600 ? "20%" : "10%"}]}>
            <TouchableOpacity 
                style={[styles.cardPequeño, { width: width > 600 ? "30%" : "40%",height:width > 600 ? "90%" : "90%",}]} 
                onPress={() =>navigation.navigate('ListaEmpleados')}
            >
                <View >
                   
                    <View style={styles.buttonImageContainer}>
                        
                        <Image 
                            source={porEmpleado}
                            resizeMode='contain'
                            style={styles.buttonImage} 
                        />
                        
                        <Text style={styles.buttonText}>
                           Act. por empleado
                        </Text>
                    </View>
                </View>       
            </TouchableOpacity>   
            <TouchableOpacity 
                 style={[styles.cardPequeño, { width: width > 600 ? "30%" : "40%",height:width > 600 ? "90%" : "90%",}]} 
                onPress={() => navigation.navigate('Reportes')}>
                    <View style={{flexDirection:"row"}}>
                    
                    <View style={styles.buttonImageContainer}>
                        
                        <Image 
                            source={reportes} 
                            resizeMode='contain'
                            style={styles.buttonImage} 
                        />
                        
                        <Text style={styles.buttonText}>
                           Reportes
                        </Text>
                    </View>
                </View>   
                         
            </TouchableOpacity>   
        </View> 
         
        <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.cardPequeño, { width: width > 600 ? "30%" : "40%",height:width > 600 ? "90%" : "90%",}]} 
              onPress={handleSincronizar}
              >
                <View style={{flexDirection:"row"}}>
                    {estadoSinc &&
                        <Image
                            source={require("../assets/sync-circle.png")}
                            style={styles.checkIcon}
                        />
                    }
                    <View style={styles.buttonImageContainer}>
                        
                        <Image 
                            source={cargar} 
                            resizeMode='contain'
                            style={styles.buttonImage} 
                        />
                        
                        <Text style={styles.buttonText}>
                            Sincronizar
                        </Text>
                    </View>
                </View>   
            </TouchableOpacity>
        </View>
        
      </SafeAreaView>
    );
 
}

/*
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
 */

const styles = StyleSheet.create({
    safeArea:{ 
        
        flex: 1,
        backgroundColor: '#f0fff0',
    },
   header:{
    backgroundColor:'',
    paddingTop:10,
    paddingBottom:10,
    paddingHorizontal:20,
    
   },
   headerText:{
    fontFamily:'bold',
    fontSize:24,
    
   },
   simpleText:{
    fontSize:16,
    color:'grey',
    

   },
    logoutContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        top: 15,
        right: 15,
        position: 'absolute',
        elevation: 5,
        width: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
       backgroundColor: '',    
        width: '100%',
        height: 200,
        marginTop: 30,
        
        alignItems: 'center',
       
    },
    logo: {
        width: '40%',
        height: '80%'
    },
    cardPequeño: {
     backgroundColor: 'white', 
      borderRadius: 20,
      elevation: 5, 
      marginHorizontal:'auto',
    
    },
    buttonContainer:{
        backgroundColor:"", 
        flexDirection:'row',
         width:"100%" , 
         height:"20%", 
         marginTop:30
        
    },
    buttonImageContainer:{
        width:"100%",
        height:'100%', 
        backgroundColor:'',
        display:'flex'
    },
    buttonText:{
        color: "grey", 
        fontWeight: "bold",  
        marginHorizontal:'auto',
        paddingBottom:10
    },
    buttonImage:{ 
        width:"70%", 
        height: "70%",
        margin:'auto' 
    },botonTablas: {
    position: "absolute",
    bottom: 0,
    left: 50,
    backgroundColor: "green",
    borderRadius: 40,
    width: 66,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10
  }
    
});

