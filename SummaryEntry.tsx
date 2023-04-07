import {SummaryEntryWithCallbackProps} from './SummaryEntryProps';
import React from 'react';
import {styles} from './App';
import {Pressable, Text, View} from 'react-native';

export function SummaryEntry(
  props: SummaryEntryWithCallbackProps,
): JSX.Element {
  const avgPrice =
    props.stockCount > 0 ? props.accumPrice / props.stockCount : 0;
  const avgPriceStr =
    avgPrice > 0
      ? avgPrice.toLocaleString('ko', {
          maximumFractionDigits: 0,
        })
      : '---';
  const fixedIncomeStr = props.accumEarn.toLocaleString('ko', {
    maximumFractionDigits: 0,
  });

  return (
    <Pressable onPress={() => props.onSelect(props.stockName)}>
      <View style={styles.colContainer}>
        <View style={styles.rowContainer}>
          <Text style={styles.flexHalf}>{props.stockName}</Text>
          <Text style={styles.flexOne}>평단가: {avgPriceStr}원</Text>
          <Text style={styles.flexOne}>+12.34%</Text>
          <Text style={styles.flexOne}>확정: +12.34%</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.flexHalf}>{props.stockCount}주</Text>
          <Text style={styles.flexOne}>현재가: 00,000원</Text>
          <Text style={styles.flexOne}>+123,456원</Text>
          <Text style={styles.flexOne}>확정: {fixedIncomeStr}원</Text>
        </View>
      </View>
    </Pressable>
  );
}
