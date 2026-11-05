// Guarda, por usuario, el hash salteado del patrón de acceso (nunca el patrón en claro).
export const PatronSchema = {
  name: "PatronSchema",
  primaryKey: "nomUsuario",
  properties: {
    nomUsuario: "string",
    salt: "string",
    hash: "string",
    habilitado: { type: "bool", default: true }
  }
};
