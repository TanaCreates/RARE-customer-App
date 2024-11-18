// In your navigation setup file (e.g., App.js or a specific Navigator file)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Account from '../Screen/Account';
import AccountInfo from '../Account/AccountInfo'; // Import your AccountInfo screen
import Security from './Security';
import DeleteAccount from './DeleteAccount';
import MFA from './MFA';
import UpdatePassword from './UpdatePassword';
import CustomerRequest from './CustomerRequest';
import OrderHistory from './OrderHistory';
import Review from './Reviews';
import ReviewHistory from './ReviewHistory';
import LogOut from './LogOut';
import Login from '../Screen/Login';
import SignUp from '../Screen/SignUp';
import Notifications from './Notifications';
const Stack = createStackNavigator();

const AccountStack = () => {
  return (
    <Stack.Navigator initialRouteName="Account" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen name="AccountInfo" component={AccountInfo} />
      <Stack.Screen name="Security" component={Security} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
      <Stack.Screen name="Notifications" component={Notifications} />

      <Stack.Screen name="MFA" component={MFA} />
      <Stack.Screen name="UpdatePassword" component={UpdatePassword} />
      <Stack.Screen name="CustomerRequest" component={CustomerRequest} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="Review" component={Review} />
      <Stack.Screen name="ReviewHistory" component={ReviewHistory} />
      <Stack.Screen name="LogOut" component={LogOut} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />

    </Stack.Navigator>
  );
};

export default AccountStack;
