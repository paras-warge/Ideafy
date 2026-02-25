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
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="SettingScreen" component={SettingScreen} />
      <Stack.Screen name="PremiumScreen" component={PremiumScreen} />
    </Stack.Navigator>
  );
}
