import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { ref, onValue, push, update, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { db } from './firebase';
import { useCart } from '../Screen/CartContext';

const MenuScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userEmail, setUserEmail] = useState('');
  const {addItemToCart} = useCart();
  useEffect(() => {
    const menuRef = ref(db, 'Menu/');
    const unsubscribe = onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      const formattedData = [];
      for (const category in data) {
        for (const item in data[category]) {
          formattedData.push({ ...data[category][item], key: item, category });
        }
      }
      setMenuItems(formattedData);
      setFilteredItems(formattedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const currentUser = getAuth().currentUser;
        if (currentUser) {
          const email = currentUser.email.replace(/\./g, '_'); // Format email for DB key
          setUserEmail(email);
          const snapshot = await get(ref(db, `users/${email}`));
          if (snapshot.exists()) {
            // Handle user data (no need to use setUserInfo)
            const userData = snapshot.val();
            console.log('User Info:', userData); // You can use this data as needed
          }
        }
      } catch (error) {
        console.error('Error fetching user info: ', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const cartRef = ref(db, `Carts/${userEmail}`);
    const unsubscribe = onValue(cartRef, (snapshot) => {
      const data = snapshot.val();
      setCartCount(data ? Object.keys(data).length : 0);
    });

    return () => unsubscribe();
  }, [userEmail]);

  const handleAddToCart = (item) => {
    const cartRef = ref(db, `Carts/${userEmail}`);
    const existingItemRef = ref(db, `Carts/${userEmail}/${item.key}`);

    onValue(existingItemRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const newQuantity = data.quantity + 1;
        const newTotalPrice = newQuantity * data.price;

        update(existingItemRef, {
          quantity: newQuantity,
          totalPrice: newTotalPrice,
        }).catch((error) => {
          console.error('Failed to update item in the cart:', error);
        });
      } else {
        push(cartRef, {
          itemName: item.item,
          price: item.price,
          quantity: 1,
          totalPrice: item.price,
        }).catch((error) => {
          console.error('Failed to add item to the cart:', error);
        });
      }
    }, {
      onlyOnce: true,
    });
    addItemToCart(); // Increment cart count when item is added
  };

  const handleSearch = (text) => {
    setSearchText(text);
    setFilteredItems(text ? menuItems.filter((item) =>
      item.item && item.item.toLowerCase().includes(text.toLowerCase())) : menuItems);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilteredItems(category === 'All' ? menuItems : menuItems.filter(item => item.category === category));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Image
          source={require('../assets/search-icon.jpg')} 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search menu..."
          placeholderTextColor="#ffffff"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.categoriesContainer}>
        {['All', 'Hot Beverages', 'Cold Beverages', 'Food', 'Snacks'].map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, selectedCategory === category && styles.selectedCategoryButton]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredItems}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={item.img ? { uri: item.img } : require('../assets/placeholder.jpeg')}
                style={styles.itemImage}
              />
            </View>
            <Text style={styles.itemName}>{item.item}</Text>
            <Text style={styles.itemPrice}>R {item.price}</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.key}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#223d3c',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    color: '#ffffff',
    paddingVertical: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  categoryButton: {
    backgroundColor: '#f4f4f4',
    padding: 8,
    borderRadius: 20,
  },
  selectedCategoryButton: {
    backgroundColor: '#223d3c',
  },
  categoryText: {
    fontSize: 12,
    color: '#223d3c',
  },
  selectedCategoryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: '#f4f4f4',
    borderRadius: 14,
    padding: 10,
    margin: 8,
    alignItems: 'center',
    width: 150,
    height: 210,
  },
  imageContainer: {
    backgroundColor: '#223d3c',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    width: 118,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: 110,
    height: 110,
  },
  itemName: {
    fontSize: 14,
    color: '#223d3c',
    textAlign: 'left',
    alignSelf: 'stretch',
    marginBottom: 3,
    paddingLeft: 6,
  },
  itemPrice: {
    fontSize: 17,
    color: '#223d3c',
    textAlign: 'left',
    alignSelf: 'stretch',
    marginBottom: 3,
    paddingLeft: 6,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#223d3c',
    borderRadius: 5,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 8,
    bottom: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MenuScreen;
