import { createNativeStackNavigator } from "@react-navigation/native-stack";


import HistoryScreen from "../src/screens/HistoryScreen";
import HomeScreen from "../src/screens/HomeScreen";
import PremiumScreen from "../src/screens/PremiumScreen";
import SettingScreen from "../src/screens/SettingScreen";
import SplashScreen from "../src/screens/SplashScreen";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{ headerShown: false, animation: "fade" }}
    >
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Histor" component={HistoryScreen} />
      <Stack.Screen name="SettingScree" component={SettingScreen} />
      <Stack.Screen name="PremiumScree" component={PremiumScreen} />
    </Stack.Navigator>
  );
}
