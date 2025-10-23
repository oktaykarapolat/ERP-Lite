// app/(tabs)/index.tsx
import { addDoc, collection, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../../src/config/firebaseConfig';

export default function TabOneScreen() {
  const [productName, setProductName] = useState('');
  const [stock, setStock] = useState('');
  const [products, setProducts] = useState<{ id: string; name: string; stock: number; timestamp: Date }[]>([]);

  useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'products'), () => {
    loadProducts(); // Veri değiştiğinde tekrar yükle
  });
  return () => unsubscribe();
}, []);

  const loadProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    stock: data.stock || 0,
    timestamp: data.timestamp || new Date(),
  };
});
      
      setProducts(productList);
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      Alert.alert('Hata', 'Ürünler yüklenemedi.');
    }
  };

  const addProduct = async () => {
    if (!productName.trim() || !stock.trim()) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        name: productName.trim(),
        stock: parseInt(stock.trim(), 10),
        timestamp: new Date(),
      });
      setProductName('');
      setStock('');
      loadProducts();
      Alert.alert('Başarılı', 'Ürün eklendi!');
    } catch (error) {
      console.error('Ürün eklenirken hata:', error);
      Alert.alert('Hata', 'Ürün eklenemedi.');
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text>Stok: {item.stock}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Stok Yönetimi</Text>

      <TextInput
  style={[styles.input, { color: '#333' }]} // 👈 style içinde color belirttik
  placeholder="Ürün adı"
  placeholderTextColor="#888"
  value={productName}
  onChangeText={setProductName}
/>
      

     <TextInput
  style={[styles.input, { color: '#333' }]}
  placeholder="Stok miktarı"
  placeholderTextColor="#888"
  value={stock}
  onChangeText={setStock}
  keyboardType="numeric"
/>

      <Button title="Ürün Ekle" onPress={addProduct} color="#2196F3" />

      <Text style={styles.listTitle}>Kayıtlı Ürünler:</Text>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
 input: {
  borderWidth: 1,
  borderColor: '#361e1eff',
  padding: 12,
  marginBottom: 10,
  borderRadius: 8,
  backgroundColor: '#fff',
  fontSize: 16,
  color: '#333', //  Yazı rengi koyulaştırdık
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  productItem: {
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#321e1eff',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});