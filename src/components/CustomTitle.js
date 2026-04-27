import React from 'react'
import { View, Text, StyleSheet } from 'react-native';
import {  useWindowDimensions } from 'react-native';
export default function CustomTitle({title}){

  return (
    
    <View style={styles.container}>
            
        <Text style={styles.text}>
            {title}
        </Text>
    </View>
  )
}


const styles = StyleSheet.create({

    container:{
         
        paddingBottom: 10,
        marginHorizontal:'auto',
        backgroundColor: '#2e7d3200',
        justifyContent: 'flex-end',
        zIndex: 0,
        },
text: {    
         color: '#0d0d0d', 
            elevation: 5, 
            textAlign: 'center',
            backgroundColor:"white", 
            width: 250, 
            paddingVertical:10, 
            borderRadius: 50, 
            fontWeight:'bold'
    }
});