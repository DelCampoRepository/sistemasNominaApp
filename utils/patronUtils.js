import { sha256 } from "js-sha256";

const LONGITUD_SALT = 16;
const CARACTERES_SALT = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
export const PUNTOS_MINIMOS_PATRON = 4;

export function patronArrayAString(patronArray) {
  return patronArray.join("-");
}

function generarSalt() {
  let salt = "";
  for (let i = 0; i < LONGITUD_SALT; i++) {
    salt += CARACTERES_SALT[Math.floor(Math.random() * CARACTERES_SALT.length)];
  }
  return salt;
}

function calcularHash(patronArray, salt) {
  return sha256(`${patronArrayAString(patronArray)}:${salt}`);
}

export function existePatron(realmInstance, nomUsuario) {
  if (!nomUsuario) return false;
  const registro = realmInstance.objectForPrimaryKey("PatronSchema", nomUsuario);
  return !!registro && registro.habilitado === true;
}

export function guardarPatron(realmInstance, nomUsuario, patronArray) {
  const salt = generarSalt();
  const hash = calcularHash(patronArray, salt);

  realmInstance.write(() => {
    realmInstance.create(
      "PatronSchema",
      { nomUsuario, salt, hash, habilitado: true },
      "modified"
    );
  });
}

export function validarPatron(realmInstance, nomUsuario, patronArray) {
  const registro = realmInstance.objectForPrimaryKey("PatronSchema", nomUsuario);
  if (!registro || registro.habilitado !== true) return false;

  const hashIngresado = calcularHash(patronArray, registro.salt);
  return hashIngresado === registro.hash;
}

export function eliminarPatron(realmInstance, nomUsuario) {
  const registro = realmInstance.objectForPrimaryKey("PatronSchema", nomUsuario);
  if (!registro) return;

  realmInstance.write(() => {
    realmInstance.delete(registro);
  });
}

export function establecerPatronHabilitado(realmInstance, nomUsuario, habilitado) {
  const registro = realmInstance.objectForPrimaryKey("PatronSchema", nomUsuario);
  if (!registro) return;

  realmInstance.write(() => {
    registro.habilitado = habilitado;
  });
}
