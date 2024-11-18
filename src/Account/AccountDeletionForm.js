import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { db, auth } from '../Screen/firebase'; // Import Realtime Database and Auth from config
import { ref, push, set } from 'firebase/database'; // Realtime Database methods
import { signInWithEmailAndPassword } from 'firebase/auth'; // For email/password authentication
import { RadioButton } from 'react-native-paper'; // Ensure you have react-native-paper installed

const DeleteAccount = () => {
    const [userEmail, setUserEmail] = useState('');
    const [deletionReason, setDeletionReason] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [password, setPassword] = useState(''); // State for password
    const [errorMessage, setErrorMessage] = useState(''); // State for error messages

    // Fetch the current logged-in user's email from Firebase Authentication
    useEffect(() => {
        const fetchUserEmail = () => {
            const user = auth.currentUser;
            if (user) {
                setUserEmail(user.email); // Set the email if user is authenticated
            } else {
                setUserEmail('No user logged in'); // Fallback if no user is logged in
            }
        };
        fetchUserEmail();
    }, []);

    // Handle input change for reason
    const handleReasonChange = (value) => {
        setDeletionReason(value);
    };

    // Handle input change for password
    const handlePasswordChange = (value) => {
        setPassword(value);
    };

    // Handle adding a new deletion request to Realtime Database
    const handleAddDeletionRequest = async () => {
        if (!isConfirmed) {
            Alert.alert('Confirmation Required', 'You need to confirm your decision before submitting.');
            return;
        }

        try {
            // Sign in with email and password to verify the user's identity
            await signInWithEmailAndPassword(auth, userEmail, password);

            const deletionId = push(ref(db, 'deletion')).key; // Generate a new deletion ID in Realtime Database

            const deletionPayload = {
                email: userEmail,
                reason: deletionReason,
            };

            await set(ref(db, `deletion/${deletionId}`), deletionPayload); // Save to Realtime Database
            Alert.alert('Success', 'Deletion request submitted successfully!');
            resetForm(); // Clear form after submitting
        } catch (error) {
            console.error('Error submitting deletion request:', error);
            if (error.code === 'auth/wrong-password') {
                setErrorMessage('Incorrect password. Please try again.');
            } else {
                Alert.alert('Error', 'Could not submit the request');
            }
        }
    };

    // Reset the form fields
    const resetForm = () => {
        setDeletionReason('');
        setIsConfirmed(false);
        setPassword(''); // Clear the password field
        setErrorMessage(''); // Clear any error messages
    };

    return (
        <View style={styles.formContainer}>
            <Text style={styles.title}>Deletion Request Form</Text>
            <Text style={styles.subtitle}>Are you sure you want to delete your request?</Text>

            <View style={styles.confirmationRow}>
                <Text style={styles.label}>Confirm Deletion:</Text>
                <View style={styles.radioGroup}>
                    <RadioButton
                        value="no"
                        status={!isConfirmed ? 'checked' : 'unchecked'}
                        onPress={() => setIsConfirmed(false)}
                    />
                    <Text style={styles.label}>No</Text>
                    <RadioButton
                        value="yes"
                        status={isConfirmed ? 'checked' : 'unchecked'}
                        onPress={() => setIsConfirmed(true)}
                    />
                    <Text style={styles.label}>Yes</Text>
                </View>
            </View>

            <View style={styles.requestRow}>
                <Text style={styles.label}>Email:</Text>
                <TextInput
                    style={styles.input}
                    value={userEmail}
                    editable={false} // Read-only
                />
            </View>

            <View style={styles.requestRow}>
                <Text style={styles.label}>Password:</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="Enter your password"
                    secureTextEntry
                />
            </View>

            <View style={styles.requestRow}>
                <Text style={styles.label}>Reason for Deletion:</Text>
                <TextInput
                    style={styles.input}
                    value={deletionReason}
                    onChangeText={handleReasonChange}
                    placeholder="Enter reason for deletion"
                    multiline
                />
            </View>

            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

            <TouchableOpacity style={styles.submitButton} onPress={handleAddDeletionRequest}>
                <Text style={styles.submitButtonText}>Submit Deletion Request</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        fontFamily: 'serif',  // Custom font
        color: '#082c24',
        textAlign: 'center',
    },
    label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
    fontFamily: 'serif',
  },
    subtitle: {
        fontSize: 15,
        marginBottom: 10,
        color: 'red',
    },
    confirmationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 25,
        color: 'black',
        width: '100%',
      },
    radioGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
                color: 'black',

    },
    requestRow: {
        marginBottom: 10,
    },
    emailInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    passwordInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        padding: 10,
        backgroundColor: '#f9f9f9',
        height: 100,
    },
    errorMessage: {
        color: 'red',
        marginBottom: 10,
    },
    submitButton: {
        marginTop: 9,
        backgroundColor: '#223d3c',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default DeleteAccount;
