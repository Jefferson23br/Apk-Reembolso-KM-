import React, { useState, useCallback } from 'react';
import { Text, StyleSheet, SafeAreaView, FlatList, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import StaticBackground from '../../components/StaticBackground';
import { getToken } from '../../storage/authStorage';
import { API_URL } from '../../constants/apiConfig';
import Icon from 'react-native-vector-icons/Ionicons';

export default function VeiculosScreen() {
    const [veiculos, setVeiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const fetchVeiculos = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/veiculos`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Não foi possível carregar os veículos.');
            }
            const data = await response.json();
            setVeiculos(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchVeiculos();
        }, [])
    );

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return 'Data inválida';
        }

        return date.toLocaleDateString('pt-BR', {
            timeZone: 'UTC', 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderVeiculoItem = ({ item }) => {
        const dataInicio = formatDateForDisplay(item.data_inicio_aluguel);
        const dataFim = item.data_fim_aluguel ? formatDateForDisplay(item.data_fim_aluguel) : 'Em uso';

        return (
            <TouchableOpacity 
                style={styles.itemContainer} 
                onPress={() => navigation.navigate('VehicleForm', { vehicle: item })}
            >
                <View style={styles.placaContainer}>
                    <Text style={styles.placaText}>{item.placa}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.descricaoText}>{item.descricao}</Text>
                    <Text style={styles.dataText}>Aluguel: {dataInicio} - {dataFim}</Text>
                </View>
                <Icon name="chevron-forward-outline" size={22} color="#fff" />
            </TouchableOpacity>
        );
    };

    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="#FFFFFF" />;
        }
        if (error) {
            return <Text style={styles.errorText}>{error}</Text>;
        }
        return (
            <FlatList
                data={veiculos}
                renderItem={renderVeiculoItem}
                keyExtractor={item => item.id.toString()}
                style={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum veículo cadastrado.</Text>}
            />
        );
    };

    return (
        <StaticBackground>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Meus Veículos</Text>
                {renderContent()}

                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('VehicleForm')}
                >
                    <Icon name="add-outline" size={30} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>
        </StaticBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', paddingTop: 20, },
    title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5, },
    list: { width: '100%', paddingHorizontal: 20, },
    itemContainer: { backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 10, padding: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', },
    placaContainer: { backgroundColor: '#FFF', borderRadius: 5, paddingVertical: 8, paddingHorizontal: 12, marginRight: 15, },
    placaText: { color: '#000', fontWeight: 'bold', fontSize: 16, },
    infoContainer: { flex: 1, },
    descricaoText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', },
    dataText: { color: '#CCCCCC', fontSize: 12, },
    errorText: { color: '#ffc107', fontSize: 16, },
    emptyText: { color: '#FFFFFF', textAlign: 'center', marginTop: 50, fontSize: 16, },
    fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 30, bottom: 30, backgroundColor: '#007bff', borderRadius: 30, elevation: 8, shadowColor: '#000', shadowRadius: 5, shadowOpacity: 0.3, shadowOffset: { height: 2, width: 0 }, },
});