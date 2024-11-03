import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { getDatabase, ref, onValue, push, update, child, get } from 'firebase/database';
import { db, auth } from './firebase'; // Ensure Firebase and Auth are configured
import Header from './Header';

const MenuScreen = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [userInfo, setUserInfo] = useState(null); // State to store user information
  const [formattedEmail, setFormattedEmail] = useState(''); // State to store the formatted email
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All'); // State to store selected category, default is 'All'

  // Fetch the current user info and store email and userId
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const email = currentUser.email;
          const formattedEmail = email.replace(/\./g, '_'); // Replace dots with underscores

          const dbRef = ref(db);
          const snapshot = await get(child(dbRef, `users/${formattedEmail}`)); // Query by formatted email

          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserInfo(userData);
            setFormattedEmail(formattedEmail); // Set the formatted email
          } else {
            console.log("No user data found at path users/" + formattedEmail);
          }
        }
      } catch (error) {
        console.error("Error fetching user info: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch menu items from the database
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
      setFilteredItems(formattedData); // Set all items initially
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  // Fetch cart items count
  useEffect(() => {
    if (formattedEmail) {
      const cartRef = ref(db, `Carts/${formattedEmail}`);
      const unsubscribe = onValue(cartRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const cartItems = Object.keys(data).length;
          setCartCount(cartItems);
        } else {
          setCartCount(0);
        }
      });

      return () => unsubscribe(); // Clean up the listener
    }
  }, [formattedEmail]);

  // Handle Add to Cart functionality
  const handleAddToCart = (item) => {
    if (!formattedEmail) {
      console.error("No user email found, cannot add to cart");
      return;
    }

    const cartRef = ref(db, `Carts/${formattedEmail}`);
    const existingItemRef = ref(db, `Carts/${formattedEmail}/${item.key}`);

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
  };

  // Handle search functionality
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
      const filtered = menuItems.filter((item) =>
        item.item && item.item.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      handleCategorySelect(selectedCategory); // Reapply the current category filter
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      setFilteredItems(menuItems); // Show all items if 'All' is selected
    } else {
      const filtered = menuItems.filter(item => item.category === category);
      setFilteredItems(filtered);
    }
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
      <Header navigation={navigation} cartCount={cartCount} />

      <TextInput
        style={styles.searchBar}
        placeholder="Search menu..."
        value={searchText}
        onChangeText={handleSearch}
      />

      <View style={styles.categoriesContainer}>
        {['All', 'Cold Beverages', 'Food', 'Hot Beverages', 'Snacks', 'Combo Items'].map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, selectedCategory === category && styles.selectedCategoryButton]} // Highlight selected category
            onPress={() => handleCategorySelect(category)}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}> {/* Highlight selected category text */}
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredItems}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ItemDetails', { item: item.key, category: item.category })}>
            <View style={styles.itemContainer}>
              <Image
                source={item.img ? { uri: item.img } : require('../assets/placeholder.jpeg')}
                style={styles.itemImage}
              />
              <Text style={styles.itemName}>{item.item}</Text>
              <Text style={styles.itemPrice}>R {item.price}</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
                <Image source={require('../assets/cart.png')} style={{ width: 30, height: 30 }} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.key}
        numColumns={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  searchBar: {
    height: 40,
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 15,
    margin: 15,
    backgroundColor: '#ffffff',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 11,
  },
  selectedCategoryButton: {
    backgroundColor: '#223d3c',
  },
  categoryText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: '#000000',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  itemContainer: {
    backgroundColor: '#223d3c',
    margin: 9,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    width: 120,
  },
  itemImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  itemName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: '#ffffff',
    marginBottom: 3,
    textAlign: 'center',
  },
  itemPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 10,
    color: '#ffffff',
    marginBottom: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 5,
  },
});

export default MenuScreen;
