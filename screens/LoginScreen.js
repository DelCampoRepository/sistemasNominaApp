import { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import logo from '../assets/logo.png';
import * as services from '../services/services'
import localStorage from '../utils/localStorage';
import { deleteRealmDatabase, getRealmInstance } from '../realm';
//import { obtenerNavesPorUsuario } from '../services/naves';
import { SurcosContext } from '../Contexts/SurcosContext';


export default function LoginScreen({ navigation }) {


  const { setCodigoTemporada, setCodJefNave, codJefNave, setCodigoLote, CodigoLote, setToken,
    setCodigoUbicacion, CodigoTemporada, codigoUbicacion }
    = useContext(SurcosContext);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [inputUser, setInputUser] = useState('jefnavcos12');
  const [inputPassword, setInputPassword] = useState('jncos12');

  const [userData, setUserData] = useState(null);
  const [realmInstance, setRealmInstance] = useState(null);
  const [semanaActiva, setSemanaActiva] = useState(null);
  const [evSemana, setEvsemana] = useState(false)

  // Inicializamos Realm solo una vez
  useEffect(() => {
    const inicializarRealm = async () => {

      setRealmInstance(await getRealmInstance());
    };
    inicializarRealm();

  }, []);


  const handleLogin = async () => {
    try {
      const response = await services.login({
        nombreUsuario: inputUser,
        password: inputPassword
      })


      console.log(response)
      if (!response.isValid) {

        Alert.alert("Del Campo y Asociados", "Usuario o contraseña inválido.")
        return;
      }


      await localStorage.set("USER_DATA", JSON.stringify(response.data))

      setUserData(response.data);
      setToken(response.data)


    } catch (error) {
      console.error("Error en login:", error);
      Alert.alert("Del Campo y Asociados", "No se pudo establecer conexión con el servidor.")
    }
  };


  return (

    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Image
          source={logo}
          style={styles.logo}
        />

        <TextInput
          label="Usuario"
          value={inputUser}
          style={{ width: '70%', marginTop: 10, backgroundColor: '#FFF' }}
          mode="outlined"
          maxLength={15}
          onChangeText={text => setInputUser(text)}
          textColor="black"
          selectionColor="black"
          outlineColor="green"
          activeOutlineColor="#006000"
          theme={{
            colors: {
              primary: 'green',
              onSurfaceVariant: 'green',
              surfaceVariant: '#FFF',
            }
          }}
        />

        <TextInput
          label="Contraseña"
          value={inputPassword}
          secureTextEntry={!passwordVisible}
          right={<TextInput.Icon
            icon={passwordVisible ? "eye-off" : "eye"}
            onPress={() => setPasswordVisible(!passwordVisible)}
            color="black" />}
          style={{ width: '70%', marginTop: 10, backgroundColor: '#FFF' }}
          mode="outlined"
          maxLength={20}
          onChangeText={text => setInputPassword(text)}
          textColor="black"
          selectionColor="black"
          outlineColor="green"
          activeOutlineColor="#006000"
          theme={{
            colors: {
              primary: 'green',
              onSurfaceVariant: 'green',
              surfaceVariant: '#FFF',
            }
          }}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>INICIAR SESION</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fff0',
    width: '100%',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 80,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 35,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 8,
    fontSize: 12,
    backgroundColor: 'white',
    color: 'black'
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  PasswordInput: {
    flex: 1,
    height: 35,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 12,
    backgroundColor: 'white',
    color: 'black',
  },
  passwordIcon: {
    right: 10,
  },
  loginButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    width: '70%',
    alignItems: 'center',
    marginTop: 25,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});