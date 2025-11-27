import { registerRootComponent } from 'expo';
import App from './App';
import { PaperProvider } from 'react-native-paper';
export default function main() {
    return (
        <PaperProvider >
            <App />
        </PaperProvider>
    );

}

registerRootComponent(main);
