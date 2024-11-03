import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../Screen/Home';
import MenuStack from '../Screen/MenuStack';
import AccountStack from '../Account/AccountStack';
import PodStack from '../Screen/PodsStack';
import Pods from '../Screen/Pods';
import PodDetail from '../Screen/PodDetail';
import BookingProcess from '../Screen/BookingProcess';
import AccountInfo from '../Account/AccountInfo';
import Cart from '../Screen/Cart';
import { Image } from 'react-native';

// Create Tab and Stack Navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator for the Pods tab to include PodDetail
const PodsStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Pods" component={Pods} />
      <Stack.Screen name="PodDetail" component={PodDetail} />
      <Stack.Screen name="BookingProcess" component={BookingProcess} />
      <Stack.Screen name="AccountInfo" component={AccountInfo} />
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen name="Cart" component={Cart} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{
          tabBarIcon: () => (
            <Image source={require('../assets/navHome.png')} style={{ width: 30, height: 30 }} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Menu" 
        component={MenuStack} 
        options={{
          tabBarIcon: () => (
            <Image source={require('../assets/navMenu.png')} style={{ width: 30, height: 30 }} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Pods" 
        component={PodStack} 
        options={{
          tabBarIcon: () => (
            <Image source={require('../assets/navSleepPods.png')} style={{ width: 30, height: 30 }} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Account" 
        component={AccountStack} 
        options={{
          tabBarIcon: () => (
            <Image source={require('../assets/navUser.png')} style={{ width: 30, height: 30 }} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
