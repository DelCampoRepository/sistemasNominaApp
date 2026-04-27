
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

// ── Orden de inserción ───────────────────────────────────────────────────────
// SurcoAvance primero porque EmpleadoCapturado lo referencia en surcosAvances

const ORDEN_IMPORT = [
  'SurcoAvance',          // sin dependencias
  'Surco',                // sin dependencias
  'SurcoDecimal',         // sin dependencias
  'ActiviadesPorEmpleado',// sin dependencias
  'EmpleadoCapturado',    // depende de SurcoAvance
];

// ── Importar ─────────────────────────────────────────────────────────────────

export const importarJSONaRealmManual = async (realm) => {
  try {
    // 1. El usuario elige el archivo JSON
    const resultado = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (resultado.canceled) return;

    // 2. Leer y parsear
    const contenido = await FileSystem.readAsStringAsync(
      resultado.assets[0].uri
    );
    const data = JSON.parse(contenido);

    // 3. Escribir en Realm
    realm.write(() => {

      // Primero limpia los schemas que se van a restaurar
      ORDEN_IMPORT.forEach(schemaName => {
        if (!data[schemaName] && schemaName !== 'SurcoAvance') return;
        try {
          realm.delete(realm.objects(schemaName));
        } catch (e) {
          // Schema vacío, no hay nada que limpiar
        }
      });

      // Luego inserta en orden
      ORDEN_IMPORT.forEach(schemaName => {
        if (!data[schemaName]) return;

        data[schemaName].forEach(obj => {
          try {
            realm.create(schemaName, obj);
          } catch (e) {
            console.warn(`Error creando ${schemaName}:`, e.message);
          }
        });
      });
    });

    console.log('✅ Datos restaurados correctamente');

  } catch (error) {
    console.error('❌ Error al importar:', error);
  }
};
