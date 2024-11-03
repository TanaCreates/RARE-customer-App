import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';

const PodDetail = ({ route, navigation }) => {
    const pod = route?.params?.pod; // Safely access pod object

    if (!pod) {
        // If pod is undefined, render a fallback UI
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No pod details available.</Text>
                <Button title="Go Back" onPress={() => navigation.goBack()} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image style={styles.image} source={{ uri: pod.imageUrl }} />
            <Text style={styles.title}>Bed: {pod.bedNumber}</Text>
            <Text>Price: ${pod.price} per hour</Text>
            <Text>Person Count: {pod.personCount}</Text>
            <Text>Amenities: {pod.amenities ? pod.amenities.join(', ') : 'None'}</Text>
            <Button title="Book Now" onPress={() => {/* Handle booking logic */ }} />
            <Button title="Add to Cart" onPress={() => {/* Handle add to cart logic */ }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f0f0f0',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default PodDetail;
