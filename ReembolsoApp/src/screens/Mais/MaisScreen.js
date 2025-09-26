import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import StaticBackground from '../../components/StaticBackground';
import { AuthContext } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function MaisScreen() {
  const { signOut } = React.useContext(AuthContext);
  const navigation = useNavigation();

  return (
    <StaticBackground>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Mais Opções</Text>
        
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('PagamentoForm')}>
            <Icon name="wallet-outline" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.menuButtonText}>Lançar Pagamento</Text>
        </TouchableOpacity>
        
        {/* ----- */}
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Relatorios')}>
            <Icon name="document-text-outline" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.menuButtonText}>Relatórios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuButton, styles.logoutButton]} onPress={signOut}>
            <Icon name="log-out-outline" size={24} color="#fff" style={styles.icon} />
            <Text style={styles.menuButtonText}>Sair do Aplicativo</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </StaticBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', padding: 20, },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 40, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5, },
  menuButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 12, paddingVertical: 18, paddingHorizontal: 20, width: '100%', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', },
  icon: { marginRight: 15, },
  menuButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', },
  logoutButton: { backgroundColor: 'rgba(220, 53, 69, 0.7)', borderColor: 'rgba(220, 53, 69, 1)', marginTop: 30, }
});