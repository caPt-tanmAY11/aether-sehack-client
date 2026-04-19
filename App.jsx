import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { SocketProvider } from "./src/hooks/SocketContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SocketProvider>
          <RootNavigator />
          <StatusBar style="light" />
        </SocketProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
