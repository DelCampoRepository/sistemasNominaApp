import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import Actividades from '../screens/Actividades';
import ActividadesScreen from '../screens/ActividadesScreen';
import BotonNave from '../screens/BotonNave';
import ReportesScreen from '../screens/ReportesScreen';
import EmpleadosScreen from '../screens/EmpleadosScreen';
import ReportesAct from '../screens/ReportesAct';
import ListaSurcos from '../screens/ListaSurcos';
import ListaEmpleados from '../screens/ListaEmpleados';
import PantallaTablaDatos from '../screens/PantallaTablaDatos';
import LoadingScreen from '../screens/LoadingScreen';
import ReporteEmpleadosScreen from '../screens/ReporteEmpleadosScreen';
import { View,Text } from 'react-native';
import {  useWindowDimensions } from 'react-native';
const Stack = createNativeStackNavigator();



export default function AppNavigator() {

     const { width, height } = useWindowDimensions();

    return (
        
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio', headerShown:false }} />
           
            <Stack.Screen name="Reportes" component={ReportesScreen}options={{headerShown: false, headerTitle: 'Reportes', headerTitleAlign: 'center'}} />
          
            <Stack.Screen name="Loading"
                component={LoadingScreen}
                options={{
                     headerShown: false,
                    headerTitleAlign: 'center',
                  
                }}
            />

            
                <Stack.Screen
                name="Reporte Empleados"
                component={ReporteEmpleadosScreen}
                options={{
                      headerShown: false,
                    headerTitleAlign: 'center',
                   
                }}
            />

            <Stack.Screen
                name="pantallaTablaDatos"
                component={PantallaTablaDatos}
                options={{
                    headerTitleAlign: 'center',
                   
                }}

            />
            
            <Stack.Screen
                name="Actividades"
                component={Actividades}
                options={{
                    title: 'Naves',
               
                  headerShown: false,
                    headerTitleAlign: 'center',
                   
                  
                }}
            />

            <Stack.Screen
                name="BotonNave"
                component={BotonNave}
                options={({ route }) => ({
                    headerTitle: () => <CustomBotonNaveHeaderTitle route={route} />,
                    headerTitleAlign: 'center',
                   
                })}
            />

            

            <Stack.Screen
                name="ActividadesScreen"
                component={ActividadesScreen}
                options={{
                         headerShown: false,
                    headerTitle: 'Actividades',
                    headerTitleAlign: 'center',
                    
                }}
            />

            <Stack.Screen
                name="Empleados"
                component={EmpleadosScreen}
                options={{
                    headerTitle: 'Empleados',
                    headerTitleAlign: 'center',
                  
                }}
            />

            <Stack.Screen
                name="ReporteAct"
                component={ReportesAct}
                options={({ route }) => ({
                    headerShown: true,
                    title: route.params?.titulo || 'Reporte por Empleados',
                   
                })}
            />

            <Stack.Screen
                name="ListaSurcos"
                component={ListaSurcos}
                options={{
                    headerShown: false,
                    title: 'Lista de Surcos',
                    headerTitleAlign: 'center',
                    
                }}
            />

            <Stack.Screen
                name="ListaEmpleados"
                component={ListaEmpleados}
                options={{
                    headerTransparent: true,
                    headerTitleAlign: 'center',
                    headerShown: false,
                    }}
               
            />
        </Stack.Navigator>
    );
}
