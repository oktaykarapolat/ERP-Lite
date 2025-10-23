// app/(tabs)/explore.tsx
import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../../src/config/firebaseConfig';

export default function CustomersScreen() {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [customers, setCustomers] = useState<{ id: string; name: string; phone?: string; timestamp: Date }[]>([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const q = query(collection(db, 'customers'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const customerList: { id: string; name: string; phone?: string; timestamp: Date }[] = [];
      querySnapshot.forEach((doc) => {
       const data = doc.data();
customerList.push({
  id: doc.id,
  name: data.name || '',
  phone: data.phone || '',
  timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
});
      });
      setCustomers(customerList);
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
      Alert.alert('Hata', 'Müşteriler yüklenemedi.');
    }
  };

  const addCustomer = async () => {
    if (!customerName.trim()) {
      Alert.alert('Uyarı', 'Lütfen müşteri adını girin.');
      return;
    }

    try {
      await addDoc(collection(db, 'customers'), {
        name: customerName.trim(),
        phone: phone.trim(),
        timestamp: new Date(),
      });
      setCustomerName('');
      setPhone('');
      loadCustomers();
      Alert.alert('Başarılı', 'Müşteri eklendi!');
    } catch (error) {
      console.error('Müşteri eklenirken hata:', error);
      Alert.alert('Hata', 'Müşteri eklenemedi.');
    }
  };

  const renderCustomer = ({ item }: { item: any }) => (
    <View style={styles.customerItem}>
      <Text style={styles.customerName}>{item.name}</Text>
      <Text>Telefon: {item.phone || 'Yok'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Müşteri Takibi</Text>

      <TextInput
  style={[styles.input, { color: '#333' }]}
  placeholder="Müşteri Adı"
  placeholderTextColor="#888"
  value={customerName}
  onChangeText={setCustomerName}
/>

<TextInput
  style={[styles.input, { color: '#333' }]}
  placeholder="Telefon (isteğe bağlı)"
  placeholderTextColor="#888"
  value={phone}
  onChangeText={setPhone}
  keyboardType="phone-pad"
/>

      <Button title="Müşteri Ekle" onPress={addCustomer} color="#FF9800" />

      <Text style={styles.listTitle}>Kayıtlı Müşteriler:</Text>

      <FlatList
        data={customers}
        renderItem={renderCustomer}
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
    borderColor: '#281b1bff',
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
  customerItem: {
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  customerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});