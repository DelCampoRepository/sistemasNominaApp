import * as FileSystem from 'expo-file-system';
import { RUTA_EXPORT } from './CreadorArchivos';

// ── Orden de inserción ───────────────────────────────────────────────────────

const ORDEN_IMPORT = [
  'SurcoAvance',
  'Surco',
  'SurcoDecimal',
  'ActiviadesPorEmpleado',
  'EmpleadoCapturado',
];

// ── Importar ─────────────────────────────────────────────────────────────────

export const importarJSONaRealm = async (realm) => {
  try {
    // 1. Verificar que el archivo existe
    const info = await FileSystem.getInfoAsync(RUTA_EXPORT);
    if (!info.exists) {
      console.warn('No existe el archivo de exportación en:', RUTA_EXPORT);
      return { ok: false, error: 'Archivo no encontrado' };
    }

    // 2. Leer y parsear
    const contenido = await FileSystem.readAsStringAsync(RUTA_EXPORT, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const data = JSON.parse(contenido);

    // 3. Escribir en Realm
    realm.write(() => {

      // Limpiar schemas
      ORDEN_IMPORT.forEach(schemaName => {
        if (!data[schemaName] && schemaName !== 'SurcoAvance') return;
        try {
          realm.delete(realm.objects(schemaName));
        } catch (e) {
          // Schema vacío, no hay nada que limpiar
        }
      });

      // Insertar en orden
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
    return { ok: true };

  } catch (error) {
    console.error('❌ Error al importar:', error);
    return { ok: false, error: error.message };
  }
};