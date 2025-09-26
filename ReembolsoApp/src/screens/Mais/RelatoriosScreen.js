import React from 'react';
import { Text, StyleSheet, SafeAreaView, FlatList, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StaticBackground from '../../components/StaticBackground';
import Icon from 'react-native-vector-icons/Ionicons';

const AVAILABLE_REPORTS = [
    {
        id: 'viagensKmReembolso',
        title: '01 - Relatório de Viagens',
        description: 'Detalha KM rodado, valores a pagar e já pagos.',
        endpoint: '/api/relatorios/viagens',
        params: ['data_inicio', 'data_fim'],
    },
];


export default function RelatoriosScreen() {
    const navigation = useNavigation();

    const handleSelectReport = (report) => {

        navigation.navigate('RelatorioParams', { report });
    };

    const renderReportItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelectReport(item)}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
            <Icon name="chevron-forward-outline" size={24} color="#fff" />
        </TouchableOpacity>
    );

    return (
        <StaticBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back-outline" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Selecionar Relatório</Text>
                    <View style={{width: 28}} />
                </View>
                <FlatList
                    data={AVAILABLE_REPORTS}
                    renderItem={renderReportItem}
                    keyExtractor={item => item.id}
                    style={styles.list}
                />
            </SafeAreaView>
        </StaticBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 20, marginBottom: 20 },
    title: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    list: { width: '100%', paddingHorizontal: 20 },
    itemContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    itemTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemDescription: {
        color: '#CCCCCC',
        fontSize: 12,
        marginTop: 5,
    },
});