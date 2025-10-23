// app/(tabs)/sales.tsx
import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../../src/config/firebaseConfig';

export default function SalesScreen() {
  const [products, setProducts] = useState<{ id: string; name: string; stock: number }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [sales, setSales] = useState<{ id: string; productName: string; quantity: number; timestamp: Date }[]>([]);

  useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  const loadProducts = async () => {
    try {
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          stock: data.stock || 0,
        };
      });
      setProducts(productList);
      if (productList.length > 0 && !selectedProduct) {
        setSelectedProduct(productList[0].id);
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      Alert.alert('Hata', 'Ürünler yüklenemedi.');
    }
  };

  const loadSales = async () => {
    try {
      const q = query(collection(db, 'sales'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const salesList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          productName: data.productName || '',
          quantity: data.quantity || 0,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
        };
      });
      setSales(salesList);
    } catch (error) {
      console.error('Satışlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Satışlar yüklenemedi.');
    }
  };

  const makeSale = async () => {
    if (!selectedProduct || !quantity.trim()) {
      Alert.alert('Uyarı', 'Lütfen ürün ve miktar seçin.');
      return;
    }

    const qty = parseInt(quantity.trim(), 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Uyarı', 'Geçerli bir miktar girin.');
      return;
    }

    // Stok kontrolü
    const product = products.find(p => p.id === selectedProduct);
    if (!product || product.stock < qty) {
      Alert.alert('Hata', 'Yeterli stok yok!');
      return;
    }

    try {
      // Satış kaydı ekle
      await addDoc(collection(db, 'sales'), {
        productId: selectedProduct,
        productName: product.name,
        quantity: qty,
        timestamp: new Date(),
      });

      // Stok güncelle
      const productRef = doc(db, 'products', selectedProduct);
      await updateDoc(productRef, {
        stock: product.stock - qty,
      });

      // UI'yi güncelle
      setQuantity('');
      loadProducts(); // Stok yenilensin
      loadSales();    // Satış listesi yenilensin
      Alert.alert('Başarılı', 'Satış yapıldı!');
    } catch (error) {
      console.error('Satış yapılırken hata:', error);
      Alert.alert('Hata', 'Satış yapılamadı.');
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={[styles.productItem, selectedProduct === item.id && styles.selectedProduct]}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text>Stok: {item.stock}</Text>
      <Button title="Seç" onPress={() => setSelectedProduct(item.id)} color="#2196F3" />
    </View>
  );

  const renderSale = ({ item }: { item: any }) => (
    <View style={styles.saleItem}>
      <Text style={styles.saleName}>{item.productName}</Text>
      <Text>Miktar: {item.quantity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💰 Satış Yap</Text>

      {products.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Ürün Seç:</Text>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            style={styles.productList}
          />
        </>
      ) : (
        <Text>Ürün bulunamadı. Önce stok ekleyin.</Text>
      )}

      <TextInput
  style={[styles.input, { color: '#333' }]}
  placeholder="Miktar"
  placeholderTextColor="#888"
  value={quantity}
  onChangeText={setQuantity}
  keyboardType="numeric"
/>

      <Button title="Satış Yap" onPress={makeSale} color="#2196F3" />

      <Text style={styles.listTitle}>Satış Geçmişi:</Text>

      <FlatList
        data={sales}
        renderItem={renderSale}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productList: {
    marginBottom: 15,
  },
  productItem: {
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedProduct: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#322828ff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
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
  saleItem: {
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  saleName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});