// app/(tabs)/purchase.tsx
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View, } from 'react-native';
import { db } from '../../src/config/firebaseConfig';

export default function PurchaseScreen() {
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [quantity, setQuantity] = useState('');
  const [purchases, setPurchases] = useState<{ id: string; productName: string; supplierName: string; quantity: number; timestamp: Date }[]>([]);

  useEffect(() => {
    loadProducts();
    loadSuppliers();
    loadPurchases();
  }, []);

  const loadProducts = async () => {
    try {
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, name: data.name || '' };
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

  const loadSuppliers = async () => {
    try {
      const q = query(collection(db, 'suppliers'));
      const querySnapshot = await getDocs(q);
      const supplierList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, name: data.name || '' };
      });
      setSuppliers(supplierList);
      if (supplierList.length > 0 && !selectedSupplier) {
        setSelectedSupplier(supplierList[0].id);
      }
    } catch (error) {
      console.error('Tedarikçiler yüklenirken hata:', error);
      Alert.alert('Hata', 'Tedarikçiler yüklenemedi.');
    }
  };

  const loadPurchases = async () => {
    try {
      const q = query(collection(db, 'purchases'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const purchaseList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          productName: data.productName || '',
          supplierName: data.supplierName || '',
          quantity: data.quantity || 0,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
        };
      });
      setPurchases(purchaseList);
    } catch (error) {
      console.error('Satın alma kayıtları yüklenirken hata:', error);
      Alert.alert('Hata', 'Satın alma kayıtları yüklenemedi.');
    }
  };

  const addPurchase = async () => {
  if (!selectedProduct || !selectedSupplier || !quantity.trim()) {
    Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
    return;
  }

  const qty = parseInt(quantity.trim(), 10);
  if (isNaN(qty) || qty <= 0) {
    Alert.alert('Uyarı', 'Geçerli bir miktar girin.');
    return;
  }

  try {
    // Satın alma kaydı ekle
    await addDoc(collection(db, 'purchases'), {
      productId: selectedProduct,
      supplierId: selectedSupplier,
      productName: products.find(p => p.id === selectedProduct)?.name || '',
      supplierName: suppliers.find(s => s.id === selectedSupplier)?.name || '',
      quantity: qty,
      timestamp: new Date(),
    });

    // Stok güncelle
    const productRef = doc(db, 'products', selectedProduct);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const currentStock = productSnap.data().stock || 0;
      await updateDoc(productRef, {
        stock: currentStock + qty,
      });
    } else {
      console.log('Ürün bulunamadı:', selectedProduct);
      Alert.alert('Hata', 'Ürün bulunamadı.');
    }

    setQuantity('');
    loadPurchases();
    Alert.alert('Başarılı', 'Satın alma kaydı eklendi!');
  } catch (error: any) {
    console.error('Satın alma yapılırken hata:', error);
    Alert.alert('Hata', error.message || 'Satın alma yapılamadı.');
  }
};

  const renderPurchase = ({ item }: { item: any }) => (
    <View style={styles.purchaseItem}>
      <Text style={styles.purchaseName}>{item.productName}</Text>
      <Text>Tedarikçi: {item.supplierName}</Text>
      <Text>Miktar: {item.quantity}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Satın Alma</Text>

     {products.length > 0 ? (
  <>
    <Text style={styles.sectionTitle}>Ürün Seç:</Text>
    <FlatList
      data={products}
      horizontal
      renderItem={({ item }) => (
        <View style={[styles.buttonContainer, selectedProduct === item.id && styles.selectedButton]}>
  <Text style={styles.buttonText} onPress={() => setSelectedProduct(item.id)}>
    {item.name}
  </Text>
</View>
      )}
      keyExtractor={(item) => item.id}
      style={styles.productList}
    />
  </>
) : (
  <Text>Ürün bulunamadı. Önce stok ekleyin.</Text>
)}
      {suppliers.length > 0 ? (
  <>
    <Text style={styles.sectionTitle}>Tedarikçi Seç:</Text>
    <FlatList
  data={suppliers}
  horizontal
  renderItem={({ item }) => (
    <View style={[styles.buttonContainer, selectedSupplier === item.id && styles.selectedButton]}>
      <Text style={styles.buttonText} onPress={() => setSelectedSupplier(item.id)}>
        {item.name}
      </Text>
    </View>
  )}
  keyExtractor={(item) => item.id}
  style={styles.supplierList}
/>
  </>
) : (
  <Text>Tedarikçi bulunamadı. Önce tedarikçi ekleyin.</Text>
)}

      <TextInput
  style={[styles.input, { color: '#333' }]}
  placeholder="Miktar"
  placeholderTextColor="#888"
  value={quantity}
  onChangeText={setQuantity}
  keyboardType="numeric"
/>

      <Button title="Satın Alma Kaydı Ekle" onPress={addPurchase} color="#FF5722" />

      <Text style={styles.listTitle}>Satın Alma Geçmişi:</Text>

      <FlatList
        data={purchases}
        renderItem={renderPurchase}
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
  sectionTitleAlt: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},
productList: {
  marginBottom: 15,
},
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#945858ff',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
    sectionTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},
supplierList: {
  marginBottom: 15,
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
  purchaseItem: {
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  purchaseName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
  backgroundColor: '#f5f5f5',
  paddingHorizontal: 8,     // 👈 Yatay padding (sağ-sol)
  paddingVertical: 2,      // 👈 Düşey padding (üst-alt) → DÜŞEYDE DARALTIYOR
  borderRadius: 6,
  borderWidth: 1,
  borderColor: '#ddd',
  marginRight: 6,
  minWidth: 60,
  minHeight: 20,           // 👈 Minimum yükseklik → yazı sığsın diye
  justifyContent: 'center', // 👈 Metni düşeyde ortala
  alignItems: 'center',

},
  selectedButton: {
    backgroundColor: '#779578ff',
    borderColor: '#4CAF50',
  },
  buttonText: {
  fontSize: 14,             // 👈 Daha küçük yazı
  fontWeight: 'bold',
  color: '#333',
  textAlign: 'center',        // 👈 Metni ortala
},

});