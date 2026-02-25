import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import AppNavigator from "./navigation/AppNavigator";


import { Montserrat_800ExtraBold } from "@expo-google-fonts/montserrat";
import { Roboto_400Regular } from "@expo-google-fonts/roboto";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded] = useFonts({
    Montserrat_800ExtraBold,
    Roboto_400Regular,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <NavigationContainer>
      
        <AppNavigator />
      
    </NavigationContainer>
  );
}
