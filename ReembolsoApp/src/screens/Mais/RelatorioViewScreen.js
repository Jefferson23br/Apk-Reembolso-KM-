import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StaticBackground from '../../components/StaticBackground';
import Icon from 'react-native-vector-icons/Ionicons';
import { getToken } from '../../storage/authStorage';
import { API_URL } from '../../constants/apiConfig';
import * as Print from 'expo-print'; 

const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Inválida';
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatCurrency = (value) => {
    const number = Number(value);
    if (isNaN(number)) return 'R$ --';
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function RelatorioViewScreen({ route }) {
    const navigation = useNavigation();
    const { report, params } = route.params;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [totalKm, setTotalKm] = useState(0);
    const [totalReembolso, setTotalReembolso] = useState(0);

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = await getToken();
                const queryParams = new URLSearchParams(params).toString();
                const url = `${API_URL}${report.endpoint}?${queryParams}`;

                const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.message || 'Erro ao buscar dados do relatório.');
                }
                setData(result);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [report, params]);

    useEffect(() => {
        if (data && data.length > 0) {
            const kmSum = data.reduce((sum, item) => sum + Number(item.distancia_percorrida), 0);
            const reembolsoSum = data.reduce((sum, item) => sum + Number(item.valor_reembolso), 0);
            setTotalKm(kmSum);
            setTotalReembolso(reembolsoSum);
        }
    }, [data]);
    
    const handlePrint = async () => {
        const tableRows = data.map(item => `
            <tr>
                <td>${formatDate(item.data_viagem)}</td>
                <td>${item.local_saida || '--'}</td>
                <td>${item.local_chegada || '--'}</td>
                <td>${Number(item.distancia_percorrida).toFixed(1)}</td>
                <td>${formatCurrency(item.valor_reembolso)}</td>
                <td>${item.status_pagamento}</td>
            </tr>
        `).join('');

        const htmlContent = `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        body { font-family: sans-serif; margin: 20px; }
                        h1 { font-size: 18px; }
                        h2 { font-size: 14px; color: #555; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ccc; padding: 8px; font-size: 10px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        tfoot td { font-weight: bold; background-color: #e9ecef; }
                    </style>
                </head>
                <body>
                    <h1>${report.title}</h1>
                    <h2>Período: ${formatDate(params.data_inicio)} a ${formatDate(params.data_fim)}</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Saída</th>
                                <th>Chegada</th>
                                <th>KM</th>
                                <th>Reembolso</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3">TOTAIS</td>
                                <td>${totalKm.toFixed(1)}</td>
                                <td colspan="2">${formatCurrency(totalReembolso)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </body>
            </html>
        `;

        await Print.printAsync({
            html: htmlContent,
        });
    };

    const renderHeader = () => (
        <View style={styles.tableRowHeader}>
            <Text style={[styles.tableCell, styles.headerText, {flex: 1.5}]}>Data</Text>
            <Text style={[styles.tableCell, styles.headerText, {flex: 2.5}]}>Saída</Text>
            <Text style={[styles.tableCell, styles.headerText, {flex: 2.5}]}>Chegada</Text>
            <Text style={[styles.tableCell, styles.headerText, {flex: 1, textAlign: 'right'}]}>KM</Text>
            <Text style={[styles.tableCell, styles.headerText, {flex: 1.5, textAlign: 'right'}]}>Reembolso</Text>
        </View>
    );

    const renderRow = ({ item }) => (
        <View style={styles.tableRow}>
            <Text style={[styles.tableCell, {flex: 1.5}]}>{formatDate(item.data_viagem)}</Text>
            <Text style={[styles.tableCell, {flex: 2.5}]} numberOfLines={2}>{item.local_saida || '--'}</Text>
            <Text style={[styles.tableCell, {flex: 2.5}]} numberOfLines={2}>{item.local_chegada || '--'}</Text>
            <Text style={[styles.tableCell, {flex: 1, textAlign: 'right'}]}>{Number(item.distancia_percorrida).toFixed(1)}</Text>
            <Text style={[styles.tableCell, {flex: 1.5, textAlign: 'right'}]}>{formatCurrency(item.valor_reembolso)}</Text>
        </View>
    );

    const renderFooter = () => (
        <View style={styles.tableRowFooter}>
            <Text style={[styles.tableCell, styles.footerText, {flex: 6.5}]}>TOTAIS</Text>
            <Text style={[styles.tableCell, styles.footerTotalText, {flex: 1, textAlign: 'right'}]}>{totalKm.toFixed(1)}</Text>
            <Text style={[styles.tableCell, styles.footerTotalText, {flex: 1.5, textAlign: 'right'}]}>{formatCurrency(totalReembolso)}</Text>
        </View>
    );
    
    return (
        <StaticBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back-outline" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title} numberOfLines={1}>{report.title}</Text>
                    {/*  */}
                    <TouchableOpacity onPress={handlePrint} disabled={loading || data.length === 0}>
                        <Icon name="print-outline" size={28} color={loading || data.length === 0 ? '#555' : '#fff'} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <View style={styles.reportContainer}>
                        <Text style={styles.periodText}>
                            Período: {formatDate(params.data_inicio)} a {formatDate(params.data_fim)}
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View>
                                <FlatList
                                    ListHeaderComponent={renderHeader}
                                    data={data}
                                    renderItem={renderRow}
                                    keyExtractor={(item, index) => index.toString()}
                                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum dado encontrado para este período.</Text>}
                                    ListFooterComponent={data.length > 0 ? renderFooter : null}
                                />
                            </View>
                        </ScrollView>
                    </View>
                )}
            </SafeAreaView>
        </StaticBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 20, marginBottom: 10 },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', flexShrink: 1, marginHorizontal: 10 },
    errorText: { color: '#ffc107', fontSize: 16, textAlign: 'center', marginTop: 50 },
    emptyText: { color: '#FFFFFF', textAlign: 'center', marginTop: 50, fontSize: 16, padding: 20 },
    reportContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.65)', marginHorizontal: 10, marginBottom: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', overflow: 'hidden', },
    periodText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', textAlign: 'center', padding: 15, backgroundColor: 'rgba(255, 255, 255, 0.1)', },
    tableRowHeader: { flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 12, paddingHorizontal: 10, },
    tableRow: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
    tableCell: { color: '#fff', fontSize: 12, textAlign: 'left', minWidth: 80, paddingHorizontal: 5, textShadowColor: 'rgba(0, 0, 0, 0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1, },
    headerText: { fontWeight: 'bold', color: '#fff' },
    tableRowFooter: { flexDirection: 'row', backgroundColor: 'rgba(0, 0, 0, 0.8)', paddingVertical: 12, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.3)', },
    footerText: { fontWeight: 'bold', color: '#fff', fontSize: 13, },
    footerTotalText: { fontWeight: 'bold', color: '#28a745', fontSize: 13, },
});