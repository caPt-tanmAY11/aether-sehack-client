import "./global.css";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { SocketProvider } from "./src/hooks/SocketContext";
import { ThemeProvider, useTheme } from "./src/hooks/ThemeContext";

function AppInner() {
  const { isDark } = useTheme();
  return (
    <>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <SocketProvider>
            <AppInner />
          </SocketProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
