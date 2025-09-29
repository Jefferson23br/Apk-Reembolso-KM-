import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity, Platform, Image, Modal } from 'react-native';
import StaticBackground from '../../components/StaticBackground';
import { API_URL } from '../../constants/apiConfig';
import { getToken } from '../../storage/authStorage';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const CustomPicker = ({ label, selectedValue, onValueChange, items, iconName }) => (
    <View style={styles.inputWrapper}>
        <Icon name={iconName} size={22} color="#fff" style={styles.icon} />
        <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.picker}
            dropdownIconColor="#FFFFFF"
        >
            {items.map(item => <Picker.Item key={item.value} label={item.label} value={item.value} />)}
        </Picker>
    </View>
);

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

export default function DespesaFormScreen({ route, navigation }) {
    const despesaToEdit = route.params?.despesa;

    const [loading, setLoading] = useState(false);
    const [veiculos, setVeiculos] = useState([]);
    const [veiculoId, setVeiculoId] = useState('');
    const [dataDespesa, setDataDespesa] = useState(new Date());
    const [tipoDespesa, setTipoDespesa] = useState('Combustível');
    const [formaPagamento, setFormaPagamento] = useState('Débito');
    const [valor, setValor] = useState('');
    const [km, setKm] = useState('');
    const [statusPagamento, setStatusPagamento] = useState('Não Pago');
    const [descricao, setDescricao] = useState('');
    const [linkComprovante, setLinkComprovante] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchVeiculos = async () => {
            const token = await getToken();
            const response = await fetch(`${API_URL}/api/veiculos`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            setVeiculos(data);
        };
        fetchVeiculos();

        if (despesaToEdit) {
            setVeiculoId(despesaToEdit.veiculo_id);
            setDataDespesa(new Date(despesaToEdit.data_despesa));
            setTipoDespesa(despesaToEdit.tipo_despesa);
            setFormaPagamento(despesaToEdit.forma_pagamento);
            setValor(String(despesaToEdit.valor).replace('.', ','));
            setKm(String(despesaToEdit.km || ''));
            setStatusPagamento(despesaToEdit.status_pagamento);
            setDescricao(despesaToEdit.descricao || '');
            setLinkComprovante(despesaToEdit.link_comprovante);
        }
    }, [despesaToEdit]);

    const chooseImageSource = () => {
        Alert.alert(
            "Anexar Comprovante",
            "Escolha de onde você quer adicionar a imagem:",
            [
                { text: "Tirar Foto", onPress: handleCameraLaunch },
                { text: "Escolher da Galeria", onPress: handleImagePick },
                { text: "Cancelar", style: "cancel" }
            ]
        );
    };

    const handleCameraLaunch = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua câmera.');
            return;
        }
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: false, 
            quality: 0.7,
        });
        if (!result.canceled) {
            uploadImage(result.assets[0]);
        }
    };

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar sua galeria de fotos.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false, // Sem corte
            quality: 0.7,
        });
        if (!result.canceled) {
            uploadImage(result.assets[0]);
        }
    };

    const uploadImage = async (asset) => {
        setLoading(true);
        const token = await getToken();
        const formData = new FormData();
        formData.append('comprovante', {
            uri: asset.uri,
            name: asset.fileName || 'comprovante.jpg',
            type: asset.mimeType || 'image/jpeg',
        });

        try {
            const response = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erro no upload');
            setLinkComprovante(data.filePath);
            Alert.alert('Sucesso', 'Comprovante anexado!');
        } catch (error) {
            Alert.alert('Erro de Upload', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!veiculoId || !dataDespesa || !valor) {
            Alert.alert('Erro', 'Veículo, data e valor são obrigatórios.');
            return;
        }
        setLoading(true);

        const token = await getToken();
        const method = despesaToEdit ? 'PUT' : 'POST';
        const url = despesaToEdit ? `${API_URL}/api/despesas/${despesaToEdit.id}` : `${API_URL}/api/despesas`;
        
        const bodyData = {
            veiculo_id: veiculoId,
            data_despesa: formatDateToISO(dataDespesa),
            tipo_despesa: tipoDespesa,
            forma_pagamento: formaPagamento,
            valor: parseFloat(valor.replace('.', '').replace(',', '.')),
            km: km ? parseInt(km, 10) : null,
            status_pagamento: statusPagamento,
            descricao: descricao,
            link_comprovante: linkComprovante,
        };

        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(bodyData) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            Alert.alert('Sucesso!', `Despesa ${despesaToEdit ? 'atualizada' : 'cadastrada'} com sucesso!`);
            navigation.goBack();
        } catch (error) {
            Alert.alert('Erro ao Salvar', error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async () => {
        if (!despesaToEdit) return;
    
        Alert.alert(
            "Confirmar Exclusão",
            "Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const token = await getToken();
                            const response = await fetch(`${API_URL}/api/despesas/${despesaToEdit.id}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const result = await response.json();
                            if (!response.ok) throw new Error(result.message);
    
                            Alert.alert('Sucesso!', 'Despesa excluída com sucesso!');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Erro ao Excluir', error.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };
    
    const handleDownload = async () => {
        if (!linkComprovante) return;
    
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos de permissão para salvar arquivos na sua galeria.');
            return;
        }
    
        setLoading(true);
        const fileUri = FileSystem.documentDirectory + linkComprovante.split('/').pop();
        const fullUrl = `${API_URL}${linkComprovante.replace('/public', '')}`;
    
        try {
            const { uri } = await FileSystem.downloadAsync(fullUrl, fileUri);
            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert('Sucesso!', 'Comprovante salvo na sua galeria de fotos.');
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível baixar o comprovante.');
        } finally {
            setLoading(false);
            setModalVisible(false);
        }
    };

    return (
        <StaticBackground>
            <SafeAreaView style={styles.safeArea}>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Image
                                source={{ uri: `${API_URL}${linkComprovante?.replace('/public', '')}` }}
                                style={styles.modalImage}
                                resizeMode="contain"
                            />
                            <View style={styles.modalButtonRow}>
                                <TouchableOpacity style={[styles.button, styles.modalButton]} onPress={handleDownload} disabled={loading}>
                                    <Icon name="download-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
                                    <Text style={styles.buttonText}>{loading ? 'Baixando...' : 'Baixar'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.button, styles.modalButton, styles.backButton]} onPress={() => setModalVisible(false)}>
                                    <Icon name="close-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
                                    <Text style={styles.buttonText}>Fechar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.title}>{despesaToEdit ? 'Editar Despesa' : 'Cadastrar Despesa'}</Text>

                    <CustomPicker
                        iconName="car-sport-outline"
                        selectedValue={veiculoId}
                        onValueChange={(itemValue) => setVeiculoId(itemValue)}
                        items={[{ label: 'Selecione um Veículo...', value: '' }, ...veiculos.map(v => ({ label: `${v.placa} (${v.descricao})`, value: v.id }))]}
                    />

                    <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowDatePicker(true)}>
                        <Icon name="calendar-outline" size={22} color="#fff" style={styles.icon} />
                        <Text style={styles.dateText}>{dataDespesa.toLocaleDateString('pt-BR')}</Text>
                    </TouchableOpacity>

                    <CustomPicker
                        iconName="pricetag-outline"
                        selectedValue={tipoDespesa}
                        onValueChange={(itemValue) => setTipoDespesa(itemValue)}
                        items={[{ label: 'Combustível', value: 'Combustível' }, { label: 'Manutenção Veicular', value: 'Manutenção Veicular' }, { label: 'Implemento', value: 'Implemento' }]}
                    />
                    
                    <View style={styles.inputWrapper}>
                        <Icon name="cash-outline" size={22} color="#fff" style={styles.icon} />
                        <TextInput style={styles.input} value={valor} onChangeText={setValor} placeholder="Valor (Ex: 150,00)" placeholderTextColor="#ccc" keyboardType="numeric" />
                    </View>

                    <View style={styles.inputWrapper}>
                        <Icon name="speedometer-outline" size={22} color="#fff" style={styles.icon} />
                        <TextInput style={styles.input} value={km} onChangeText={setKm} placeholder="KM do Veículo (Opcional)" placeholderTextColor="#ccc" keyboardType="numeric" />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={chooseImageSource}>
                        <Icon name="camera-outline" size={20} color="#fff" style={{marginRight: 10}} />
                        <Text style={styles.buttonText}>{linkComprovante ? 'Alterar Comprovante' : 'Anexar Comprovante'}</Text>
                    </TouchableOpacity>
                    
                    {linkComprovante && (
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Image source={{ uri: `${API_URL}${linkComprovante.replace('/public', '')}` }} style={styles.comprovantePreview} />
                        </TouchableOpacity>
                    )}

                    {despesaToEdit && (
                         <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete} disabled={loading}>
                            <Icon name="trash-outline" size={20} color="#fff" style={{marginRight: 10}} />
                            <Text style={styles.buttonText}>Excluir Despesa</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit} disabled={loading}>
                        <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar Despesa'}</Text>
                    </TouchableOpacity>
                </ScrollView>

                {showDatePicker && (
                    <DateTimePicker value={dataDespesa} mode="date" display="default" onChange={(event, date) => { setShowDatePicker(false); if(date) setDataDespesa(date); }} />
                )}
            </SafeAreaView>
        </StaticBackground>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'transparent' },
    container: { flexGrow: 1, padding: 20 },
    title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 12, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', },
    icon: { marginRight: 10 },
    input: { flex: 1, color: '#FFFFFF', paddingVertical: Platform.OS === 'ios' ? 18 : 14, fontSize: 16, },
    dateText: { color: '#FFFFFF', paddingVertical: 14, fontSize: 16, },
    picker: { flex: 1, color: '#FFFFFF', height: 50 },
    button: { flexDirection: 'row', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10, backgroundColor: '#007bff' },
    saveButton: { backgroundColor: '#28a745' },
    deleteButton: { backgroundColor: '#dc3545' },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', },
    comprovantePreview: { width: 100, height: 100, borderRadius: 10, alignSelf: 'center', marginVertical: 15, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.5)' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '95%',
        height: '80%',
        alignItems: 'center',
    },
    modalImage: {
        width: '100%',
        height: '85%',
        borderRadius: 10,
    },
    modalButtonRow: {
        flexDirection: 'row',
        marginTop: 20,
        width: '100%',
        justifyContent: 'space-around',
    },
    modalButton: {
        flex: 0.45,
        backgroundColor: '#007bff',
    },
    backButton: {
        backgroundColor: '#6c757d',
    },
});