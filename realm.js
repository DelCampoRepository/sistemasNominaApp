import Realm from "realm";
import { schemas } from "./schemas";

export const getRealmInstance = async () => {
    try {
        // Si ya existe la instancia global y sigue abierta, la reutilizamos
        if (global.realmInstance && !global.realmInstance.isClosed) {
            return global.realmInstance;
        }

        const realm = await Realm.open({
            schema: schemas,
            schemaVersion: 2,
            deleteRealmIfMigrationNeeded: true,
        });

        global.realmInstance = realm;
        return realm;
    } catch (error) {
        console.error("Error al obtener la instancia de Realm:", error);
        throw error;
    }
};

// 🧹 Eliminar la base de datos de Realm correctamente
export const deleteRealmDatabase = async () => {
    const realmPath = Realm.defaultPath;

    try {
        // Si hay una instancia global abierta, la cerramos primero
        if (global.realmInstance && !global.realmInstance.isClosed) {
            global.realmInstance.close();
            global.realmInstance = null; // Limpia la referencia
        }

        // Ahora sí eliminamos el archivo físico
        Realm.deleteFile({ path: realmPath });
        console.log("✅ Base de datos de Realm eliminada correctamente.");
    } catch (error) {
        console.error("❌ Error al eliminar la base de datos de Realm:", error);
    }
};
