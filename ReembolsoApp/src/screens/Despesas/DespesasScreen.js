import React, { useState, useCallback } from 'react';
import { Text, StyleSheet, SafeAreaView, FlatList, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import StaticBackground from '../../components/StaticBackground';
import { getToken } from '../../storage/authStorage';
import { API_URL } from '../../constants/apiConfig';
import Icon from 'react-native-vector-icons/Ionicons';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data inválida';
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatCurrency = (value) => {
    const number = Number(value);
    if (isNaN(number)) return 'R$ 0,00';
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function DespesasScreen() {
    const [despesas, setDespesas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const fetchDespesas = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/despesas?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error('Não foi possível carregar as despesas.');
            }
            const data = await response.json();
            setDespesas(data.despesas);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDespesas();
        }, [])
    );

    const renderDespesaItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('DespesaForm', { despesa: item })}>
            <View style={styles.iconContainer}>
                <Icon name={item.tipo_despesa === 'Combustível' ? 'flame-outline' : 'build-outline'} size={24} color="#fff" />
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.tipoText}>{item.tipo_despesa}</Text>
                <Text style={styles.descricaoText}>{item.placa} - {formatDate(item.data_despesa)}</Text>
            </View>
            <View style={styles.valorContainer}>
                <Text style={styles.valorText}>{formatCurrency(item.valor)}</Text>
                <Text style={[styles.statusText, { color: item.status_pagamento === 'Pago' ? '#28a745' : '#ffc107' }]}>
                    {item.status_pagamento}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 50 }} />;
        }
        if (error) {
            return <Text style={styles.errorText}>{error}</Text>;
        }
        return (
            <FlatList
                data={despesas}
                renderItem={renderDespesaItem}
                keyExtractor={item => item.id.toString()}
                style={styles.list}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma despesa registrada.</Text>}
            />
        );
    };

    return (
        <StaticBackground>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Minhas Despesas</Text>
                {renderContent()}
                
                {/* ----- */}
                <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('DespesaForm')}>
                    <Icon name="add-outline" size={30} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>
        </StaticBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', paddingTop: 20 },
    title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
    list: { width: '100%', paddingHorizontal: 20 },
    itemContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    iconContainer: {
        marginRight: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 10,
        borderRadius: 25,
    },
    infoContainer: {
        flex: 1,
    },
    tipoText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    descricaoText: {
        color: '#CCCCCC',
        fontSize: 12,
    },
    valorContainer: {
        alignItems: 'flex-end',
    },
    valorText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#ffc107',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 30,
        bottom: 30,
        backgroundColor: '#007bff',
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000', shadowRadius: 5, shadowOpacity: 0.3, shadowOffset: { height: 2, width: 0 },
    },
});