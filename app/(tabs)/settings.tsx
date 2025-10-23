// app/(tabs)/settings.tsx
import { signOut } from 'firebase/auth';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { auth } from '../../src/config/firebaseConfig';

export default function SettingsScreen() {
  const handleSignOut = async () => {
  try {
    await signOut(auth);
    console.log('Çıkış yapıldı'); // 👈 Bu satırı ekle
    Alert.alert('Başarılı', 'Çıkış yapıldı!');
  } catch (error) {
    console.error('Çıkış yapılırken hata:', error);
    Alert.alert('Hata', 'Çıkış yapılamadı.');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Ayarlar</Text>
      <Button title="Çıkış Yap" onPress={handleSignOut} color="#f44336" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
});