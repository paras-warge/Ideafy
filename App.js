// App.js
import { NavigationContainer } from "@react-navigation/native";
import * as ExpoSplash from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import AppNavigator from "./navigation/AppNavigator";


ExpoSplash.preventAutoHideAsync();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      // If you load fonts/assets, do it here before setReady(true)
      // Example:
      // await Font.loadAsync({...});

      setReady(true);
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      await ExpoSplash.hideAsync(); 
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
}
