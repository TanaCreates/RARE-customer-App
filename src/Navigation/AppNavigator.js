import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, View, Text, StyleSheet } from 'react-native';
import Home from '../Screen/Home';
import MenuStack from '../Screen/MenuStack';
import AccountStack from '../Account/AccountStack';
import PodStack from '../Screen/PodsStack';
import CartStack from '../Screen/CartStack';
import { useCart } from '../Screen/CartContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { cartCount } = useCart(); // Access cart count from context

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
        name="Cart"
        component={CartStack}
        options={{
          tabBarIcon: () => (
            <View style={styles.iconWrapper}>
              <Image source={require('../assets/basket.png')} style={{ width: 30, height: 30 }} />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
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

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'relative',
    width: 30,
    height: 30,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AppNavigator;
