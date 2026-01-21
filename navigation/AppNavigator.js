import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HistoryScreen from "../src/screens/HistoryScreen";
import HomeScreen from "../src/screens/HomeScreen";
import SplashScreen from "../src/screens/SplashScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
    </Stack.Navigator>
  );
}
