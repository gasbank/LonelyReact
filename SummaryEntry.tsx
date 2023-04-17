import {SummaryEntryWithCallbackProps} from './SummaryEntryProps';
import React, {useEffect, useState} from 'react';
import {styles} from './App';
import {Pressable, Text, View} from 'react-native';

export function SummaryEntry(
  props: SummaryEntryWithCallbackProps,
): JSX.Element {
  const [closePrice, setClosePrice] = useState('');
  const [friendlyName, setFriendlyName] = useState('');

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

  useEffect(() => {
    const fetchDataKr = async (stockId: string) => {
      try {
        const response = await fetch(
          `https://m.stock.naver.com/api/stock/${stockId}/basic`,
        );
        const json = await response.json();
        return json;
      } catch (error) {
        console.error(error);
      }
    };

    const executeAsyncFetch = async (stockId: string) => {
      const data = await fetchDataKr(stockId);
      const stockPrice = data.closePrice
        ? parseInt(data.closePrice.replace(/,/g, ''), 10)
        : undefined;
      setClosePrice(stockPrice ? stockPrice.toLocaleString('ko') : '---');
      setFriendlyName(data.stockName);
    };

    executeAsyncFetch(props.stockName).then(() => {});
  }, [props.stockName]);

  return (
    <Pressable onPress={() => props.onSelect(props.stockName)}>
      <View style={styles.colContainer}>
        <View style={styles.rowContainer}>
          <Text style={styles.flexHalf}>
            {friendlyName} {props.stockName}
          </Text>
          <Text style={styles.flexOne}>평단가: {avgPriceStr}원</Text>
          <Text style={styles.flexOne}>+12.34%</Text>
          <Text style={styles.flexOne}>확정: +12.34%</Text>
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.flexHalf}>
            {props.stockCount.toLocaleString('ko')}주
          </Text>
          <Text style={styles.flexOne}>현재가: {closePrice}원</Text>
          <Text style={styles.flexOne}>+123,456원</Text>
          <Text style={styles.flexOne}>확정: {fixedIncomeStr}원</Text>
        </View>
      </View>
    </Pressable>
  );
}
