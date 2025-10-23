// app/(tabs)/reports.tsx
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { db } from '../../src/config/firebaseConfig';




// 👇 Bu satırı ekle — TypeScript’e "auth kullanılıyor" diye haber ver

import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { firebaseConfig } from '../../src/config/firebaseConfig'; // 👈 firebaseConfig import edelim

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // 👈 auth’u burada tanımla

export const handleSignOut = async () => {
  try {
    await signOut(auth);
    // Oturum kapatıldığında otomatik olarak giriş ekranına yönlendirilir
    // çünkü app/_layout.tsx zaten bu kontrolü yapıyor
  } catch (error) {
    console.error('Çıkış yapılırken hata:', error);
    Alert.alert('Hata', 'Çıkış yapılamadı.');
  }
};


export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [totalSoldQuantity, setTotalSoldQuantity] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalStock, setTotalStock] = useState(0);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // Satışları yükle
      const salesSnapshot = await getDocs(collection(db, 'sales'));
      const salesCount = salesSnapshot.size;
      let soldQty = 0;
      salesSnapshot.forEach((doc) => {
        const data = doc.data();
        soldQty += data.quantity || 0;
      });

      // Ürünleri yükle
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productCount = productsSnapshot.size;
      let stockTotal = 0;
      productsSnapshot.forEach((doc) => {
        const data = doc.data();
        stockTotal += data.stock || 0;
      });

      // State’leri güncelle
      setTotalSalesCount(salesCount);
      setTotalSoldQuantity(soldQty);
      setTotalProducts(productCount);
      setTotalStock(stockTotal);
    } catch (error) {
      console.error('Raporlar yüklenirken hata:', error);
      Alert.alert('Hata', 'Raporlar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={{ marginTop: 10, color: '#333' }}>Yükleniyor...</Text>
    </View>
  );
}

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text>Raporlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Raporlar</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Toplam Satış Sayısı</Text>
        <Text style={styles.cardValue}>{totalSalesCount}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Toplam Satılan Adet</Text>
        <Text style={styles.cardValue}>{totalSoldQuantity}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Toplam Ürün Sayısı</Text>
        <Text style={styles.cardValue}>{totalProducts}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Toplam Stok Miktarı</Text>
        <Text style={styles.cardValue}>{totalStock}</Text>
      </View>
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
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
});
