import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity, Platform } from 'react-native';
import StaticBackground from '../../components/StaticBackground';
import { API_URL } from '../../constants/apiConfig';
import { getToken } from '../../storage/authStorage';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const formatDateToBR = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

const formatDateToISO = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function VehicleFormScreen({ route, navigation }) {
    const vehicleToEdit = route.params?.vehicle;

    const [placa, setPlaca] = useState('');
    const [descricao, setDescricao] = useState('');
    const [loading, setLoading] = useState(false);
    const [dataInicio, setDataInicio] = useState(new Date());
    const [dataFim, setDataFim] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerTarget, setDatePickerTarget] = useState('inicio');

    useEffect(() => {
        if (vehicleToEdit) {
            setPlaca(vehicleToEdit.placa);
            setDescricao(vehicleToEdit.descricao);
            setDataInicio(new Date(vehicleToEdit.data_inicio_aluguel));
            if (vehicleToEdit.data_fim_aluguel) {
                setDataFim(new Date(vehicleToEdit.data_fim_aluguel));
            }
        }
    }, [vehicleToEdit]);

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (datePickerTarget === 'inicio') {
                setDataInicio(selectedDate);
            } else {
                setDataFim(selectedDate);
            }
        }
    };

    const showDatepickerFor = (target) => {
        setDatePickerTarget(target);
        setShowDatePicker(true);
    };

    const handleSubmit = async () => {
        if (!placa || !descricao || !dataInicio) {
            Alert.alert('Erro', 'Por favor, preencha os campos de placa, descrição e data de início.');
            return;
        }
        setLoading(true);

        const token = await getToken();
        const method = vehicleToEdit ? 'PUT' : 'POST';
        const url = vehicleToEdit ? `${API_URL}/api/veiculos/${vehicleToEdit.id}` : `${API_URL}/api/veiculos`;
        
        const bodyData = {
            placa,
            descricao,
            data_inicio_aluguel: formatDateToISO(dataInicio),
            data_fim_aluguel: formatDateToISO(dataFim),
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(bodyData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Ocorreu um erro.');
            
            Alert.alert('Sucesso!', `Veículo ${vehicleToEdit ? 'atualizado' : 'cadastrado'} com sucesso!`);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Erro', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <StaticBackground>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>{vehicleToEdit ? 'Editar Veículo' : 'Cadastrar Veículo'}</Text>
                    
                    <View style={styles.inputWrapper}>
                        <Icon name="car-outline" size={22} color="#fff" style={styles.icon} />
                        <TextInput style={styles.input} value={placa} onChangeText={setPlaca} placeholder="Placa" placeholderTextColor="#ccc" />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Icon name="document-text-outline" size={22} color="#fff" style={styles.icon} />
                        <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} placeholder="Descrição" placeholderTextColor="#ccc" />
                    </View>

                    <TouchableOpacity style={styles.inputWrapper} onPress={() => showDatepickerFor('inicio')}>
                        <Icon name="calendar-outline" size={22} color="#fff" style={styles.icon} />
                        <Text style={styles.dateText}>{dataInicio ? formatDateToBR(dataInicio) : 'Data de Início do Aluguel'}</Text>
                    </TouchableOpacity>

                    {vehicleToEdit && (
                        <TouchableOpacity style={styles.inputWrapper} onPress={() => showDatepickerFor('fim')}>
                            <Icon name="calendar-outline" size={22} color="#fff" style={styles.icon} />
                            <Text style={styles.dateText}>{dataFim ? formatDateToBR(dataFim) : 'Data de Fim do Aluguel (Opcional)'}</Text>
                        </TouchableOpacity>
                    )}
                    
                    {/* ---  --- */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => navigation.goBack()}>
                            <Text style={styles.backButtonText}>Voltar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit} disabled={loading}>
                            <Text style={styles.saveButtonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
                {showDatePicker && (
                    <DateTimePicker
                        value={datePickerTarget === 'inicio' ? dataInicio : (dataFim || new Date())}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}
            </SafeAreaView>
        </StaticBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'transparent' },
    container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
    title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5, },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 12,
        marginBottom: 20,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        paddingVertical: Platform.OS === 'ios' ? 18 : 14,
        fontSize: 16,
    },
    dateText: {
        color: '#FFFFFF',
        paddingVertical: Platform.OS === 'ios' ? 18 : 14,
        fontSize: 16,
    },
   
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1, 
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 5, 
    },
    saveButton: {
        backgroundColor: '#28a745',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#6c757d',
    },
    backButtonText: {
        color: '#FFFFFF', 
        fontSize: 16,
        fontWeight: 'bold',
    }
});