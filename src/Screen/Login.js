import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigation } from '@react-navigation/native';

function Login() {
  const navigation = useNavigation();

  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For confirm password
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockout, setLockout] = useState(false);

  // Lockout effect for login attempts
  useEffect(() => {
    if (loginAttempts >= 5) {
      setLockout(true);
      const timeout = setTimeout(() => {
        setLockout(false);
        setLoginAttempts(0);
      }, 20000); // Lockout for 20 seconds
      return () => clearTimeout(timeout);
    }
  }, [loginAttempts]);

  // Handle login process
  const handleLogin = async () => {
    setError(null);  // Reset errors
    setLoading(true); // Start loading

    // Validate email and password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address.');
      setLoading(false); // Stop loading
      return;
    }

    if (password.length === 0) {
      setError('Password is required.');
      setLoading(false); // Stop loading
      return;
    }

    if (lockout) {
      setError('Too many unsuccessful attempts. Please try again in 20 seconds.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user.emailVerified) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Email not verified', 'Please verify your email before logging in.');
        await auth.signOut();
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      setLoginAttempts(prevAttempts => prevAttempts + 1); // Increment login attempts
    } finally {
      setLoading(false); // Stop loading after login attempt
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        secureTextEntry={!showPassword}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity onPress={togglePasswordVisibility}>
        <Text style={styles.showPasswordText}>
          {showPassword ? 'Hide Password' : 'Show Password'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPassword}>Forgot password? <Text style={styles.resetText}>Reset</Text></Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin} 
        disabled={loading || lockout}
      >
        <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'LOGIN'}</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? <Text style={styles.signUp}>Sign Up</Text></Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'serif',
    color: '#082c24',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    padding: 10,
    marginBottom: 20,
    paddingLeft: 40,
    backgroundColor: '#f5f5f5',
    fontSize: 16,
  },
  showPasswordText: {
    textAlign: 'right',
    color: '#008080',
    marginBottom: 10,
  },
  forgotPassword: {
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
  },
  resetText: {
    color: '#ff6347',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#082c24',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupText: {
    color: '#333',
  },
  signUp: {
    color: '#008080',
    fontWeight: 'bold',
  },
});

export default Login;
