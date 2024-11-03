import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { auth, db } from './firebase'; // Adjust path as necessary
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import zxcvbn from 'zxcvbn';

function SignUp() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const validateFullName = (name) => /^[A-Za-z\s]+$/.test(name);

  const checkPasswordStrength = (password) => {
    const strength = zxcvbn(password);
    setPasswordStrength(strength.score);
  };

  const togglePasswordVisibility = (setVisibilityFunc) => {
    setVisibilityFunc((prev) => !prev);
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (!validateFullName(name) || !validateFullName(surname)) {
      setError('Full name can only contain letters and spaces.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return; // Exit the function if passwords do not match
    }

    // Proceed with Firebase signup
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        sendEmailVerification(user)
          .then(() => {
            Alert.alert('Verification Email Sent', 'Please check your email to verify your account.');
            auth.signOut();
          })
          .catch((error) => {
            Alert.alert('Error', error.message);
          });
      })
      .catch((error) => {
        Alert.alert('Sign Up Error', error.message);
      });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Account</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          autoComplete="name"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={surname}
          onChangeText={setSurname}
          autoComplete="name-family"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoComplete="email"
          keyboardType="email-address"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              checkPasswordStrength(value);
            }}
            autoComplete="password-new"
          />
          <Button title={showPassword ? "Hide" : "Show"} onPress={() => togglePasswordVisibility(setShowPassword)} />
        </View>
        <Text style={styles.passwordStrength}>Password Strength: {['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength]}</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoComplete="password-new"
          />
          <Button title={showConfirmPassword ? "Hide" : "Show"} onPress={() => togglePasswordVisibility(setShowConfirmPassword)} />
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {loading && <Text style={styles.loading}>Loading...</Text>}

      <TouchableOpacity style={styles.submitButton} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.linkText}>
        Already have an account?{' '}
        <Text style={styles.link} onPress={() => setShowLogin(true)}>Sign In</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 29,
    justifyContent: 'center',
    backgroundColor: '#fff', // Added background color for consistency
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'serif',  // Custom font
    color: '#082c24',   // Updated to match CheckOut styles
  },
  inputContainer: {
    marginBottom: 15, // Add margin between input sections
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black', // Color for labels
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 25,
    color: 'black', // Text color for input
    width: 350,
    backgroundColor: '#f5f5f5',

  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  
  },
  passwordStrength: {
    color: 'black', // Text color for password strength
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  loading: {
    marginBottom: 10,
    color: 'black', // Text color for loading text
  },
  submitButton: {
    backgroundColor: '#223d3c', // Changed to match button styles
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  linkText: {
    color: 'black', // Link text color
    textAlign: 'center', // Centered the text
  },
  link: {
    color: '#007BFF',
  },
});

export default SignUp;
