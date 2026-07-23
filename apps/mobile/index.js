// import '../../worklets-bootstrap';
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

// Global error handler to catch issues early
if (__DEV__) {
  const defaultHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('Global Error:', error);
    if (defaultHandler) defaultHandler(error, isFatal);
  });
}

registerRootComponent(App);
