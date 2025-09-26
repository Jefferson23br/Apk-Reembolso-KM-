import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity, TextInput, Platform } from 'react-native';
import StaticBackground from '../../components/StaticBackground';
import { API_URL } from '../../constants/apiConfig';
import { getToken } from '../../storage/authStorage';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const CustomPicker = ({ selectedValue, onValueChange, items, iconName }) => (
    <View style={styles.inputWrapper}>
        <Icon name={iconName} size={22} color="#fff" style={styles.icon} />
        <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker} dropdownIconColor="#FFFFFF">
            {items.map(item => <Picker.Item key={item.value} label={item.label} value={item.value} />)}
        </Picker>
    </View>
);

export default function ViagemFormScreen({ route, navigation }) {
    const viagemToEdit = route.params?.viagem;
    const [loading, setLoading] = useState(false);
    const [veiculos, setVeiculos] = useState([]);
    const [veiculoId, setVeiculoId] = useState('');
    const [dataViagem, setDataViagem] = useState(new Date());
    const [kmInicial, setKmInicial] = useState('');
    const [kmFinal, setKmFinal] = useState('');
    const [distancia, setDistancia] = useState('');
    const [localSaida, setLocalSaida] = useState('');
    const [localChegada, setLocalChegada] = useState('');
    const [descricao, setDescricao] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        const fetchVeiculos = async () => {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/veiculos`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            setVeiculos(data);
        };
        fetchVeiculos();

        if (viagemToEdit) {
            setVeiculoId(viagemToEdit.veiculo_id);
            setDataViagem(new Date(viagemToEdit.data_viagem));
            setKmInicial(String(viagemToEdit.km_inicial || ''));
            setDescricao(viagemToEdit.descricao || '');
            setLocalSaida(viagemToEdit.local_saida || '');
            setLocalChegada(viagemToEdit.local_chegada || '');
        }
    }, [viagemToEdit]);

    useEffect(() => {
        if (kmInicial && kmFinal) {
            const dist = parseFloat(kmFinal) - parseFloat(kmInicial);
            if (!isNaN(dist) && dist > 0) {
                setDistancia(String(dist));
            } else {
                setDistancia('');
            }
        }
    }, [kmInicial, kmFinal]);

    const handleSave = async (isDraft = false) => {
        setLoading(true);
        const token = await getToken();

        if (!veiculoId || !dataViagem) {
            Alert.alert('Atenção', 'Veículo e Data são obrigatórios.');
            setLoading(false); return;
        }
        if (!isDraft && (!distancia || parseFloat(distancia) <= 0)) {
            Alert.alert('Atenção', 'A distância percorrida é obrigatória para finalizar a viagem.');
            setLoading(false); return;
        }

        const bodyData = {
            id: viagemToEdit?.id || null,
            veiculo_id: veiculoId,
            data_viagem: dataViagem.toISOString().split('T')[0],
            km_inicial: kmInicial || null,
            descricao: descricao,
            isDraft: isDraft,
            km_final: kmFinal || null,
            distancia_percorrida: distancia || null,
            local_saida: localSaida,
            local_chegada: localChegada,
        };

        try {
            const response = await fetch(`${API_URL}/api/viagens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(bodyData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            Alert.alert('Sucesso!', result.message);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Erro ao Salvar', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <StaticBackground>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView 
                    style={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>{viagemToEdit ? 'Finalizar Viagem' : 'Lançar Viagem'}</Text>
                    
                    <View style={{paddingHorizontal: 20}}>
                        <CustomPicker
                            selectedValue={veiculoId}
                            onValueChange={(itemValue) => setVeiculoId(itemValue)}
                            items={[{ label: 'Selecione um Veículo...', value: '' }, ...veiculos.map(v => ({ label: `${v.placa} (${v.descricao})`, value: v.id }))]}
                            iconName="car-sport-outline"
                        />

                        <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowDatePicker(true)}>
                            <Icon name="calendar-outline" size={22} color="#fff" style={styles.icon} />
                            <Text style={styles.dateText}>{dataViagem.toLocaleDateString('pt-BR')}</Text>
                        </TouchableOpacity>
                        
                        {/* ---  --- */}
                        <View style={styles.inputWrapper}>
                            <Icon name="location-outline" size={22} color="#fff" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={localSaida}
                                onChangeText={setLocalSaida}
                                placeholder="Local de Saída"
                                placeholderTextColor="#ccc"
                            />
                        </View>
                        
                        <View style={styles.inputWrapper}>
                            <Icon name="location-outline" size={22} color="#fff" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={localChegada}
                                onChangeText={setLocalChegada}
                                placeholder="Local de Chegada"
                                placeholderTextColor="#ccc"
                            />
                        </View>
                        {/* - */}
                        
                        <View style={styles.row}>
                            <View style={[styles.inputWrapper, {flex: 1, paddingHorizontal: 15}]}>
                                <Icon name="speedometer-outline" size={22} color="#fff" style={styles.icon} />
                                <TextInput style={styles.input} value={kmInicial} onChangeText={setKmInicial} placeholder="KM Inicial" placeholderTextColor="#ccc" keyboardType="numeric" />
                            </View>
                            <View style={[styles.inputWrapper, {flex: 1, paddingHorizontal: 15}]}>
                                <Icon name="speedometer" size={22} color="#fff" style={styles.icon} />
                                <TextInput style={styles.input} value={kmFinal} onChangeText={setKmFinal} placeholder="KM Final" placeholderTextColor="#ccc" keyboardType="numeric" />
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Icon name="trending-up-outline" size={22} color="#fff" style={styles.icon} />
                            <TextInput style={styles.input} value={distancia} onChangeText={setDistancia} placeholder="Distância (KM)" placeholderTextColor="#ccc" keyboardType="numeric" />
                        </View>
                        
                        <View style={styles.inputWrapper}>
                            <Icon name="document-text-outline" size={22} color="#fff" style={styles.icon} />
                            <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} placeholder="Descrição" placeholderTextColor="#ccc" />
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.button, styles.draftButton]} onPress={() => handleSave(true)} disabled={loading}>
                                <Text style={styles.buttonText}>Salvar Rascunho</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={() => handleSave(false)} disabled={loading}>
                                <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar Viagem'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </ScrollView>
                {showDatePicker && (
                    <DateTimePicker value={dataViagem} mode="date" display="default" onChange={(event, date) => { setShowDatePicker(false); if(date) setDataViagem(date); }} />
                )}
            </SafeAreaView>
        </StaticBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'transparent' },
    scrollView: { flex: 1 },
    title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', minHeight: 58 },
    icon: { marginRight: 10 },
    input: { flex: 1, color: '#FFFFFF', fontSize: 16 },
    dateText: { color: '#FFFFFF', fontSize: 16 },
    picker: { flex: 1, color: '#FFFFFF', height: 50 },
    row: { flexDirection: 'row', gap: 10 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    button: { flex: 1, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
    saveButton: { backgroundColor: '#28a745' },
    draftButton: { backgroundColor: '#ffc107' },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});