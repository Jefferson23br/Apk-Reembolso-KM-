import React, { useState, useCallback, useEffect } from 'react';
import { Text, StyleSheet, SafeAreaView, FlatList, View, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import StaticBackground from '../../components/StaticBackground';
import { getToken } from '../../storage/authStorage';
import { API_URL } from '../../constants/apiConfig';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatCurrency = (value) => {
    const number = Number(value);
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function PagamentoFormScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [viagensAPagar, setViagensAPagar] = useState([]);
    const [selectedViagens, setSelectedViagens] = useState(new Set());
    const [total, setTotal] = useState(0);

    const [dataPagamento, setDataPagamento] = useState(new Date());
    const [metodoPagamento, setMetodoPagamento] = useState('PIX');
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    const fetchViagensAPagar = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/pagamentos/apagar`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Falha ao buscar viagens a pagar.');
            const data = await response.json();
            setViagensAPagar(data);
        } catch (e) {
            Alert.alert('Erro', e.message);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchViagensAPagar(); }, []));

    useEffect(() => {
        let newTotal = 0;
        selectedViagens.forEach(id => {
            const viagem = viagensAPagar.find(v => v.id === id);
            if (viagem) {
                newTotal += parseFloat(viagem.valor_reembolso);
            }
        });
        setTotal(newTotal);
    }, [selectedViagens, viagensAPagar]);

    const handleSelectViagem = (id) => {
        const newSelection = new Set(selectedViagens);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedViagens(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedViagens.size === viagensAPagar.length) {
            setSelectedViagens(new Set());
        } else {
            setSelectedViagens(new Set(viagensAPagar.map(v => v.id)));
        }
    };
    
    const handleRegisterPayment = async () => {
        if (selectedViagens.size === 0) {
            Alert.alert('Atenção', 'Selecione pelo menos uma viagem para registrar o pagamento.');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            const bodyData = {
                viagens_ids: Array.from(selectedViagens),
                data_pagamento: dataPagamento.toISOString().split('T')[0],
                metodo_pagamento: metodoPagamento,
                valor_total: total,
                descricao: `Pagamento de ${selectedViagens.size} viagens.`
            };

            const response = await fetch(`${API_URL}/api/pagamentos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(bodyData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            Alert.alert('Sucesso!', 'Pagamento registrado com sucesso!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderViagemItem = ({ item }) => {
        const isSelected = selectedViagens.has(item.id);
        return (
            <TouchableOpacity style={[styles.itemContainer, isSelected && styles.itemSelected]} onPress={() => handleSelectViagem(item.id)}>
                <Icon name={isSelected ? 'checkbox' : 'square-outline'} size={24} color={isSelected ? '#28a745' : '#fff'} />
                <View style={styles.infoContainer}>
                    <Text style={styles.itemText}>{formatDate(item.data_viagem)} - {item.placa}</Text>
                    <Text style={styles.itemSubText}>{item.descricao || 'Sem descrição'}</Text>
                </View>
                <Text style={styles.valorText}>{formatCurrency(item.valor_reembolso)}</Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <StaticBackground><ActivityIndicator size="large" color="#fff" style={{flex: 1}} /></StaticBackground>;
    }

    return (
        <StaticBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}><Icon name="arrow-back-outline" size={28} color="#fff" /></TouchableOpacity>
                    <Text style={styles.title}>Lançar Pagamento</Text>
                    <View style={{width: 28}} />
                </View>

                <FlatList
                    data={viagensAPagar}
                    renderItem={renderViagemItem}
                    keyExtractor={item => item.id.toString()}
                    style={styles.list}
                    ListHeaderComponent={
                        <TouchableOpacity style={styles.selectAllButton} onPress={handleSelectAll}>
                            <Icon name={selectedViagens.size === viagensAPagar.length ? 'checkbox' : 'square-outline'} size={20} color="#fff" />
                            <Text style={styles.selectAllText}>Selecionar Todas</Text>
                        </TouchableOpacity>
                    }
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma viagem a pagar encontrada.</Text>}
                />

                <View style={styles.formContainer}>
                    <Text style={styles.summaryText}>Total Selecionado: {formatCurrency(total)}</Text>
                    
                    <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowDatePicker(true)}>
                        <Icon name="calendar-outline" size={22} color="#fff" style={styles.icon} />
                        <Text style={styles.dateText}>{dataPagamento.toLocaleDateString('pt-BR')}</Text>
                    </TouchableOpacity>

                    <View style={styles.inputWrapper}>
                        <Icon name="card-outline" size={22} color="#fff" style={styles.icon} />
                        <Picker selectedValue={metodoPagamento} onValueChange={setMetodoPagamento} style={styles.picker} dropdownIconColor="#FFFFFF">
                            <Picker.Item label="PIX" value="PIX" />
                            <Picker.Item label="Transferência Bancária" value="Transferência Bancária" />
                            <Picker.Item label="Dinheiro" value="Dinheiro" />
                        </Picker>
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleRegisterPayment}>
                        <Text style={styles.submitButtonText}>Registrar Pagamento</Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (<DateTimePicker value={dataPagamento} mode="date" display="default" onChange={(e, date) => { setShowDatePicker(false); if(date) setDataPagamento(date); }} />)}
            </SafeAreaView>
        </StaticBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 20, marginBottom: 10 },
    title: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    list: { flex: 1 },
    selectAllButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
    selectAllText: { color: '#fff', fontWeight: 'bold' },
    itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 12, padding: 15, marginHorizontal: 20, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', gap: 15 },
    itemSelected: { backgroundColor: 'rgba(40, 167, 69, 0.3)', borderColor: '#28a745' },
    infoContainer: { flex: 1 },
    itemText: { color: '#fff', fontWeight: 'bold' },
    itemSubText: { color: '#ccc', fontSize: 12 },
    valorText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    emptyText: { color: '#FFFFFF', textAlign: 'center', marginTop: 50, fontSize: 16 },
    formContainer: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(0, 0, 0, 0.3)' },
    summaryText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', minHeight: 58 },
    icon: { marginRight: 10 },
    dateText: { color: '#FFFFFF', fontSize: 16 },
    picker: { flex: 1, color: '#FFFFFF', height: 50 },
    submitButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 12, alignItems: 'center' },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});