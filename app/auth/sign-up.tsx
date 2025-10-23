// app/auth/sign-up.tsx
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../../src/config/firebaseConfig';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Başarılı', 'Kayıt oluşturuldu! Giriş yapabilirsiniz.');
      router.replace('/auth/sign-in');
    } catch (error: any) {
      let message = 'Kayıt oluşturulamadı.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Bu e-posta zaten kullanımda.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Geçersiz e-posta adresi.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Şifre en az 6 karakter olmalı.';
      }
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Şifre (en az 6 karakter)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? "Kayıt Olunuyor..." : "Kayıt Ol"}
        onPress={handleSignUp}
        disabled={loading}
        color="#4CAF50"
      />
      <Button
        title="Giriş Yap"
        onPress={() => router.replace('/auth/sign-in')}
        color="#2196F3"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});