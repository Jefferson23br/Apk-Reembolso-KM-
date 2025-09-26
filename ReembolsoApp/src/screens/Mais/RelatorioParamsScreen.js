import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StaticBackground from '../../components/StaticBackground';
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

export default function RelatorioParamsScreen({ route }) {
    const navigation = useNavigation();
    const { report } = route.params;

    const [dataInicio, setDataInicio] = useState(new Date());
    const [dataFim, setDataFim] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerTarget, setDatePickerTarget] = useState('inicio');

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

    const handleGenerateReport = () => {
        if (dataInicio > dataFim) {
            Alert.alert("Atenção", "A data de início não pode ser posterior à data de fim.");
            return;
        }
        
        navigation.navigate('RelatorioView', { 
            report, 
            params: { 
                data_inicio: formatDateToISO(dataInicio), 
                data_fim: formatDateToISO(dataFim) 
            } 
        });
    };

    return (
        <StaticBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back-outline" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Parâmetros do Relatório</Text>
                    <View style={{width: 28}} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportDescription}>Por favor, selecione o período desejado.</Text>
                    
                    <Text style={styles.label}>Data de Início</Text>
                    <TouchableOpacity style={styles.inputWrapper} onPress={() => showDatepickerFor('inicio')}>
                        <Icon name="calendar-outline" size={22} color="#fff" style={styles.icon} />
                        <Text style={styles.dateText}>{formatDateToBR(dataInicio)}</Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Data de Fim</Text>
                    <TouchableOpacity style={styles.inputWrapper} onPress={() => showDatepickerFor('fim')}>
                        <Icon name="calendar-outline" size={22} color="#fff" style={styles.icon} />
                        <Text style={styles.dateText}>{formatDateToBR(dataFim)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleGenerateReport}>
                        <Text style={styles.buttonText}>Gerar Relatório</Text>
                    </TouchableOpacity>
                </ScrollView>

                {showDatePicker && (
                    <DateTimePicker
                        value={datePickerTarget === 'inicio' ? dataInicio : dataFim}
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
    container: { flex: 1, backgroundColor: 'transparent' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingTop: 20, marginBottom: 20 },
    title: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
    content: { padding: 20 },
    reportTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    reportDescription: { color: '#CCCCCC', fontSize: 14, textAlign: 'center', marginBottom: 30 },
    label: { color: '#FFFFFF', fontSize: 16, marginBottom: 8, },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 12, marginBottom: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', minHeight: 58 },
    icon: { marginRight: 10 },
    dateText: { color: '#FFFFFF', fontSize: 16 },
    button: { padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 20, backgroundColor: '#007bff' },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});