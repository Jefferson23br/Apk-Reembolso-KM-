import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SummaryCard = ({ title, value, color = '#007bff' }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={[styles.colorBar, { backgroundColor: color }]} />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    flex: 1, 
    minWidth: '45%', 
    margin: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  colorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  cardTitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    marginLeft: 10,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 22,
    color: '#343a40',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default SummaryCard;