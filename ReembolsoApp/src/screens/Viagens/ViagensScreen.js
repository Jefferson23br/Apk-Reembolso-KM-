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

export default function ViagensScreen() {
    const [viagens, setViagens] = useState([]);
    const [rascunhos, setRascunhos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const [viagensRes, rascunhosRes] = await Promise.all([
                fetch(`${API_URL}/api/viagens?limit=50`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/api/viagens/rascunho`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            if (!viagensRes.ok || !rascunhosRes.ok) throw new Error('Falha ao carregar dados das viagens.');
            
            const viagensData = await viagensRes.json();
            const rascunhosData = await rascunhosRes.json();
            
            setViagens(viagensData.viagens);
            setRascunhos(rascunhosData);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, []));

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pago': return styles.statusPago;
            case 'Pago Parcial': return styles.statusPagoParcial;
            case 'A Pagar': default: return styles.statusAPagar;
        }
    };

    const renderViagemItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Icon name="calendar-outline" size={16} color="#ccc" />
                    <Text style={styles.headerText}>{formatDate(item.data_viagem)}</Text>
                </View>
                <Text style={[styles.statusBadge, getStatusStyle(item.status_pagamento)]}>{item.status_pagamento}</Text>
            </View>
            <View style={styles.itemBody}>
                <Text style={styles.routeText}>{item.local_saida || 'N/A'} → {item.local_chegada || 'N/A'}</Text>
                <Text style={styles.descriptionText}>{item.descricao || 'Viagem sem descrição'}</Text>
            </View>
            <View style={styles.itemFooter}>
                <Text style={styles.footerText}>{Number(item.distancia_percorrida).toFixed(1)} km</Text>
                <Text style={styles.reembolsoText}>{formatCurrency(item.valor_reembolso)}</Text>
            </View>
        </View>
    );
    
    const renderRascunhoSection = () => (
        <View style={styles.rascunhoContainer}>
            <Text style={styles.rascunhoTitle}>Viagens em Rascunho</Text>
            {rascunhos.length === 0 ? (
                <Text style={styles.rascunhoEmptyText}>Nenhum rascunho encontrado.</Text>
            ) : (
                rascunhos.map(rascunho => (
                    <TouchableOpacity 
                        key={rascunho.id} 
                        style={styles.rascunhoItem}
                        onPress={() => navigation.navigate('ViagemForm', { viagem: rascunho })}
                    >
                        <View>
                            <Text style={styles.rascunhoItemText}>{formatDate(rascunho.data_viagem)} - {rascunho.placa}</Text>
                            <Text style={styles.rascunhoItemDesc}>{rascunho.descricao || 'Sem descrição'}</Text>
                        </View>
                        <Text style={styles.rascunhoFinalizarText}>Finalizar</Text>
                    </TouchableOpacity>
                ))
            )}
        </View>
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
                data={viagens}
                renderItem={renderViagemItem}
                keyExtractor={item => item.id.toString()}
                style={styles.list}
                ListHeaderComponent={renderRascunhoSection}
                ListEmptyComponent={
                    rascunhos.length === 0 ? <Text style={styles.emptyText}>Nenhuma viagem registrada.</Text> : null
                }
            />
        );
    };

    return (
        <StaticBackground>
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>Minhas Viagens</Text>
                {renderContent()}
                <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ViagemForm')}>
                    <Icon name="add-outline" size={30} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>
        </StaticBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', paddingTop: 20 },
    title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
    list: { width: '100%' },
    itemContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        marginHorizontal: 20,
    },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'rgba(255, 255, 255, 0.1)', },
    headerText: { color: '#FFFFFF', fontWeight: 'bold', marginLeft: 8, },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, fontSize: 12, fontWeight: 'bold', color: '#fff', },
    statusAPagar: { backgroundColor: '#ffc107', color: '#000' },
    statusPago: { backgroundColor: '#28a745' },
    statusPagoParcial: { backgroundColor: '#dc3545' },
    itemBody: { padding: 12, },
    routeText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 5, },
    descriptionText: { color: '#CCCCCC', fontSize: 14, },
    itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'rgba(0, 0, 0, 0.2)', borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)', },
    footerText: { color: '#CCCCCC', fontSize: 14, },
    reembolsoText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', },
    errorText: { color: '#ffc107', fontSize: 16, textAlign: 'center', marginTop: 50 },
    emptyText: { color: '#FFFFFF', textAlign: 'center', marginTop: 20, fontSize: 16 },
    fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 30, bottom: 30, backgroundColor: '#007bff', borderRadius: 30, elevation: 8, shadowColor: '#000', shadowRadius: 5, shadowOpacity: 0.3, shadowOffset: { height: 2, width: 0 }, },
    rascunhoContainer: { backgroundColor: 'rgba(255, 193, 7, 0.2)', borderRadius: 12, marginHorizontal: 20, marginBottom: 20, padding: 15, borderWidth: 1, borderColor: '#ffc107', },
    rascunhoTitle: { color: '#ffc107', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    rascunhoEmptyText: { color: '#fff', fontStyle: 'italic' },
    rascunhoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255, 193, 7, 0.3)' },
    rascunhoItemText: { color: '#fff', fontWeight: 'bold' },
    rascunhoItemDesc: { color: '#ccc', fontSize: 12 },
    rascunhoFinalizarText: { color: '#ffc107', fontWeight: 'bold' },
});