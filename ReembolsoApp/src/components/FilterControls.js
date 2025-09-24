import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const FilterControls = ({ onApplyFilter }) => {
  const [filterType, setFilterType] = useState('month'); 
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const anos = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];

  const handleApply = () => {
    if (filterType === 'month') {
      onApplyFilter({ filterType: 'month', mes: selectedMonth, ano: selectedYear });
    } else {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      onApplyFilter({ filterType: 'period', data_inicio: formattedStartDate, data_fim: formattedEndDate });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, filterType === 'month' && styles.typeButtonActive]}
          onPress={() => setFilterType('month')}
        >
          <Text style={[styles.typeButtonText, filterType === 'month' && styles.typeButtonTextActive]}>Mês/Ano</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, filterType === 'period' && styles.typeButtonActive]}
          onPress={() => setFilterType('period')}
        >
          <Text style={[styles.typeButtonText, filterType === 'period' && styles.typeButtonTextActive]}>Período</Text>
        </TouchableOpacity>
      </View>

      {filterType === 'month' ? (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            style={styles.picker}
          >
            {meses.map((mes, index) => (
              <Picker.Item key={index} label={mes} value={index + 1} />
            ))}
          </Picker>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
            style={styles.picker}
          >
            {anos.map((ano) => (
              <Picker.Item key={ano} label={String(ano)} value={ano} />
            ))}
          </Picker>
        </View>
      ) : (
        <View style={styles.dateContainer}>
          <TouchableOpacity onPress={() => setStartDatePickerVisibility(true)} style={styles.dateInput}>
            <Text>De: {startDate.toLocaleDateString('pt-BR')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEndDatePickerVisibility(true)} style={styles.dateInput}>
            <Text>Até: {endDate.toLocaleDateString('pt-BR')}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={(date) => { setStartDate(date); setStartDatePickerVisibility(false); }}
            onCancel={() => setStartDatePickerVisibility(false)}
          />
          <DateTimePickerModal
            isVisible={isEndDatePickerVisible}
            mode="date"
            onConfirm={(date) => { setEndDate(date); setEndDatePickerVisibility(false); }}
            onCancel={() => setEndDatePickerVisibility(false)}
          />
        </View>
      )}

      <Button title="Filtrar" onPress={handleApply} color="#007bff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#007bff',
  },
  typeButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  picker: {
    paddingVertical: 10,
    paddingHorizontal: 80,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
  },
});

export default FilterControls;