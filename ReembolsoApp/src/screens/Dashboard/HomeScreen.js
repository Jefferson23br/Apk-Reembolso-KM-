import React, { useContext, useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { getToken, removeToken } from '../../storage/authStorage';
import { API_URL } from '../../constants/apiConfig';
import AnimatedBackground from '../../components/AnimatedBackground';
import SummaryCard from '../../components/SummaryCard';
import FilterControls from '../../components/FilterControls'; 

export default function HomeScreen() {
    const { signOut } = useContext(AuthContext);
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterTitle, setFilterTitle] = useState('Resumo do Mês Atual');

    const [activeFilters, setActiveFilters] = useState({
        filterType: 'month',
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
    });

    const fetchDashboardSummary = async (filters) => {
        setLoading(true);
        setError('');
        const token = await getToken();
        const params = new URLSearchParams(filters);

        try {
            const response = await fetch(`${API_URL}/api/dashboard/summary?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Falha ao carregar o resumo do dashboard.');
            }
            const summary = await response.json();
            setSummaryData(summary);
        } catch (err) {
            setError(err.message || 'Ocorreu um erro.');
            setSummaryData(null); 
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchDashboardSummary(activeFilters);
        }, [activeFilters])
    );

    const handleApplyFilter = (newFilters) => {
        setActiveFilters(newFilters);
        if (newFilters.filterType === 'month') {
            const monthName = new Date(newFilters.ano, newFilters.mes - 1).toLocaleString('pt-BR', { month: 'long' });
            setFilterTitle(`Resumo de ${monthName}/${newFilters.ano}`);
        } else {
            const startDate = new Date(newFilters.data_inicio + 'T00:00:00').toLocaleDateString('pt-BR');
            const endDate = new Date(newFilters.data_fim + 'T00:00:00').toLocaleDateString('pt-BR');
            setFilterTitle(`Resumo de ${startDate} a ${endDate}`);
        }
    };

    const handleLogout = async () => {
        await removeToken();
        signOut();
    };

    const renderContent = () => {
        if (loading) {
            return <ActivityIndicator size="large" color="#000" />;
        }
        if (error) {
            return <Text style={styles.errorText}>{error}</Text>;
        }
        if (summaryData) {
            return (
                <View style={styles.cardsWrapper}>
                    <SummaryCard
                        title="KM Rodado no Período"
                        value={`${Number(summaryData.totalKmMes || 0).toFixed(1)} km`}
                        color="#007bff"
                    />
                    <SummaryCard
                        title="A Receber (Reembolso)"
                        value={`R$ ${Number(summaryData.totalAReceberMes || 0).toFixed(2)}`}
                        color="#ffc107"
                    />
                    <SummaryCard
                        title="Total Despesas"
                        value={`R$ ${Number(summaryData.totalDespesasMes || 0).toFixed(2)}`}
                        color="#dc3545"
                    />
                    <SummaryCard
                        title="Total Reembolsado"
                        value={`R$ ${Number(summaryData.totalReembolsadoMes || 0).toFixed(2)}`}
                        color="#28a745"
                    />
                </View>
            );
        }
        return <Text style={styles.errorText}>Nenhum dado encontrado para este período.</Text>;
    };

    return (
        <AnimatedBackground>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard</Text>
                </View>

                <FilterControls onApplyFilter={handleApplyFilter} />

                <Text style={styles.filterTitle}>{filterTitle}</Text>
                <View style={styles.contentArea}>
                    {renderContent()}
                </View>

                <View style={styles.footer}>
                    <Button title="Sair" onPress={handleLogout} color="#dc3545" />
                </View>
            </ScrollView>
        </AnimatedBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        width: '100%',
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 10,
    },
    header: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        textAlign: 'center'
    },
    contentArea: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 5,
    },
    errorText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        backgroundColor: 'rgba(255,255,0,0.8)',
        padding: 15,
        borderRadius: 5,
    },
    footer: {
        width: '90%',
        marginTop: 30,
    },
});