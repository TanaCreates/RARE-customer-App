// In your navigation setup file (e.g., App.js or a specific Navigator file)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Pods from './Pods';
import BookingProcess from './BookingProcess';
import CheckOut from './CheckOut';
import NextPage from './NextPage';
import PodDetail from './PodDetail';
import BookingSummary from './BookingSummary';
const Stack = createStackNavigator();

const PodStack = () => {
  return (
    <Stack.Navigator initialRouteName="Pods" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Pods" component={Pods} />
      <Stack.Screen name="BookingProcess" component={BookingProcess} />
      <Stack.Screen name="CheckOut" component={CheckOut} />
      <Stack.Screen name="NextPage" component={NextPage} />
      <Stack.Screen name="PodDetail" component={PodDetail} />
      <Stack.Screen name="BookingSummary" component={BookingSummary} />


    </Stack.Navigator>
  );
};

export default PodStack;
