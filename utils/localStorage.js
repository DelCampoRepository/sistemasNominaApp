import AsyncStorage from '@react-native-async-storage/async-storage';

export default {
    async get(key) {
        return await AsyncStorage.getItem(key)
    },

    async getValues(keys) {
        const values = await AsyncStorage.multiGet(keys);
        const response = {}

        values.forEach((current) => {
            const key = current[0];
            const value = current[1];
            response[key] = value
        });

        return response;
    },

    async set(key, value) {
        return await AsyncStorage.setItem(key, value);
    },

    async remove(key) {
        return await AsyncStorage.removeItem(key);
    }
}