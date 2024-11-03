// In your navigation setup file (e.g., App.js or a specific Navigator file)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Menu from './Menu';
import Cart from './Cart';
import CheckOut from './CheckOut';
import ItemDetails from './ItemDetails';
const Stack = createStackNavigator();

const MenuStack = () => {
  return (
    <Stack.Navigator initialRouteName="Menu" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Menu" component={Menu} />
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="CheckOut" component={CheckOut} />
      <Stack.Screen name="ItemDetails" component={ItemDetails} />


    </Stack.Navigator>
  );
};

export default MenuStack;
