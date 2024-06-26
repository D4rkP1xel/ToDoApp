import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from "./screens/Home/HomeScreen"
import LoginScreen from "./screens/LoginScreen/LoginScreen"
import CreateAccountScreen from "./screens/CreateAccountScreen/CreateAccountScreen"
import { QueryClientProvider, QueryClient } from "react-query"
import PerformanceScreen from "./screens/PerformanceScreen/PerformanceScreen"
import AddTaskScreen from "./screens/AddTaskScreen/AddTaskScreen"
import SettingsScreen from "./screens/SettingsScreen/SettingsScreen"
import { SafeAreaProvider } from "react-native-safe-area-context"
import EditTaskScreen from "./screens/EditTask/EditTaskScreen"

const Stack = createNativeStackNavigator()

const queryClient = new QueryClient()
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="CreateAccount"
              component={CreateAccountScreen}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Performance" component={PerformanceScreen} />
            <Stack.Screen name="AddTask" component={AddTaskScreen} />
            <Stack.Screen name="EditTask" component={EditTaskScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}

export default App
