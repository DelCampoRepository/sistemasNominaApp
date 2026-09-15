import React, { useEffect, useState } from "react";
import { View,StyleSheet,Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ReporteActividadCard({item, parametros}){
    
  
    const navigation = useNavigation();
    function handleOnPress(){
        if(item.NomCortoUnidad ==='SCO')
            navigation.navigate('ListaSurcos', {datosActivdad:item,parametros:parametros})

            //console.log(JSON.stringify(item,null,2))
          //console.log(JSON.stringify(parametros,null,2))
    }
   
    return(
        <TouchableOpacity style={styles.cardContainer} onPress={handleOnPress}>
                      
            <View style={{width:'95%', height:'50%', flexDirection:'row',backgroundColor:"", marginHorizontal:'auto'}}>
               
                <View  style={{backgroundColor:"", width:'10%',height:'100%',backgroundColor:'' }}>
                    <Image source={require("../../../assets/herramientas.png")} style={styles.icon} />
                </View>
                <View style={{backgroundColor:"", width:'90%',height:'100%',backgroundColor:'' }}>
                   <View style={{flexDirection:'row', justifyContent:'space-between',alignItems:'flex-start',marginTop:5 }}>
                     <Text style={{fontWeight:'bold', fontSize:16, marginLeft:10}}>Lote: {item.CodigoLote}</Text>
                     <Text style={{fontWeight:'bold', fontSize:16, marginRight:10}}>{item.NomCortoUnidad}</Text>
                   </View>
                    <View style={{flexDirection:'column', justifyContent:'flex-start',alignItems:'flex-start',marginTop:5 }}>
                        <Text style={{fontWeight:'bold', fontSize:14, marginLeft:10}}>{item.CodigoActividad}-{item.CodigoAvance}</Text>   
                        <Text style={{ fontSize:10, marginLeft:10}}>{item.Descripcion}</Text>   
                    </View>
                </View>  
            </View>
            <View  style={{width:'95%', height:'40%', flexDirection:'column',backgroundColor:"", marginHorizontal:'auto'}}>
                    <Text style={{ fontSize:14, marginLeft:10,}}>Total avances: {item.avanceSumado}</Text>   
                    <Text style={{ fontSize:14, marginLeft:10}}>Total jornal: {item.jornales}</Text>   
                    <Text style={{ fontSize:14, marginLeft:10}}>Total empleados: {item.totalEmpleados}</Text>   
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({

    cardContainer:{
        width:"95%",
        height:160,
        marginVertical:10,
        marginHorizontal:'auto',
        backgroundColor:"#efefef",
        borderRadius:10,
        elevation:5,
        justifyContent:'center'
        
    },
    icon: {
        width: 60,
        height: 60,
       margin:'auto',
        resizeMode:'center'
        
        
  },
  imageContainer: {
    width: "25%",
    height:'100%',
    aspectRatio: 1,
    backgroundColor:'red', margin:'auto' 
    
   
  },
})

/*
   <Image source={require("../../../assets/herramientas.png")} style={styles.icon} />      */