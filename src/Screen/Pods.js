
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { db } from './firebase';  // Only import 'db' from firebase.js
import { ref, onValue } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useFonts } from 'expo-font';

const SleepingPods = () => {
    const navigation = useNavigation();
    const auth = getAuth(); // Initialize Firebase Auth
    const [user, setUser] = useState(null); // State to track user authentication

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Set the user state based on authentication status
        });
        return () => unsubscribe(); // Clean up the listener on component unmount
    }, []);

   
    const destinations2 = [
        {
            id: '1', image: 'https://images.unsplash.com/photo-1539606420556-14c457c45507?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2xlZXBpbmclMjBwb2RzfGVufDB8fDB8fHww'
        },
        {
            id: '2', image: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fG9yJTIwdGhhbWJvJTIwaW50ZXJuYXRpb25hbCUyMGFpcnBvcnR8ZW58MHx8MHx8fDA%3D'
        },
        {
            id: '3', image: 'https://images.unsplash.com/photo-1466691623998-d607fab1ca29?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ty4lMjBSLiUyMFRhbWJvJTIwSW50ZXJuYXRpb25hbCUyMEFpcnBvcnR8ZW58MHx8MHx8fDA%3D'
        },
    ];
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
        </View>
    );

    const handleBookPress = () => {
        if (user) {
            // If user is logged in, proceed to booking process
            navigation.navigate('BookingProcess');
        } else {
            // If user is not logged in, navigate to the login page
            navigation.navigate('Login');
        }
    };

    const handleDiscoverPress = () => {
        navigation.navigate('PodDetail');
    };
const handleOutsideButtonPress = () =>{
    if (user) {
        // If user is logged in, proceed to booking process
        navigation.navigate('BookingProcess');
    } else {
        // If user is not logged in, navigate to the login page
        navigation.navigate('Login');
    }
};
    return (
        <View style={styles.but}>
        <View style={styles.container}>
            <TouchableOpacity>
                <Text style={styles.header}>Discover LALA PODS</Text>
            </TouchableOpacity>
           
            
                <FlatList
                    data={destinations2}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
        </View>
       
          <TouchableOpacity onPress={handleOutsideButtonPress} style={styles.outsideButton}>
            <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
        </View>
    
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        flex: 1,
        backgroundColor: 'white',
        padding: 10,
        Margin:0,
width:'100%',
        height:'100%',
        paddingBottom: 0,
    },
    
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        fontFamily: 'serif',  // Custom font
    color: '#082c24',
    marginLeft: 60,
    },
    card: {
        width: 310,
        height: 400,
        borderRadius: 25,
        overflow: 'hidden',
        marginLeft: 15,
        backgroundColor: 'white',
        elevation: 2,
        marginTop: 80,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    title: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 5,
        borderRadius: 5,
    },
    listContainer: {
        paddingBottom: 10,
    },
    outsideButton: {
        backgroundColor: '#223D3C',
        width: '80%', // Set to a specific width or a percentage
        height: 50, 
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 600, // You can adjust this to control the position
        borderRadius: 25, // Optional: rounds the corners of the button
        alignSelf: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default SleepingPods;
