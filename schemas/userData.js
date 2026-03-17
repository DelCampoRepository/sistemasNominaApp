export const UserDataSchema = {
  name: "UserData",
  properties: {
    estado: "int",
    codigo: "string",
    nomUsuario: "string",
    nombre: "string",
    codigoUbicacion: "string",
    token: "string",
    tokenExpira: "date"
  },
  primaryKey: "codigo"
};
