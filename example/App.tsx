import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CodePushProvider } from 'react-native-codepush-sdk';
import UpdateChecker from './src/components/UpdateChecker';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import UpdateHistoryScreen from './screens/UpdateHistoryScreen';
import { defaultConfig } from './config/codepush.config';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CodePushProvider config={defaultConfig}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'CodePush Demo' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ title: 'Settings' }}
            />
            <Stack.Screen 
              name="UpdateHistory" 
              component={UpdateHistoryScreen} 
              options={{ title: 'Update History' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        {/* <UpdateChecker /> */}
      </CodePushProvider>
    </GestureHandlerRootView>
  );
};

export default App;
