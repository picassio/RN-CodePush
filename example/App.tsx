import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

import { CodePushProvider } from '../src/sdk/CodePushProvider';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import UpdateHistoryScreen from './src/screens/UpdateHistoryScreen';
import { codePushConfig } from './src/config/codepush.config';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <CodePushProvider 
        config={codePushConfig} 
        autoCheck={true} 
        checkOnResume={true}
      >
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#007bff',
              },
              headerTintColor: '#ffffff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
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
      </CodePushProvider>
    </SafeAreaProvider>
  );
};

export default App;