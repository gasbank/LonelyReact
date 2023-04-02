import {BuySellEntryProps} from './BuySellEntryProps';
import {BuySellType} from './BuySellType';
import React from 'react';
import {styles} from './App';
import {Text, View} from 'react-native';

export function BuySellEntry(props: BuySellEntryProps): JSX.Element {
  const textColor =
    props.buySellType === BuySellType.Buy
      ? 'red'
      : props.buySellType === BuySellType.Sell
      ? 'blue'
      : 'gray';

  const entryStyle = {flex: 1, color: textColor};

  const earnStr = props.earn
    ? `${props.earn > 0 ? '+' : ''}${props.earn.toLocaleString('ko')}원`
    : '';

  return (
    <>
      <View style={styles.rowContainer}>
        <Text style={entryStyle}>
          {props.transactionDate?.toLocaleDateString('ko') || '---'}
        </Text>
        <Text style={entryStyle}>{props.stockName}</Text>
        <Text style={entryStyle}>
          {props.stockPrice?.toLocaleString('ko')}원
        </Text>
        <Text style={entryStyle}>
          {props.stockCount?.toLocaleString('ko')}주
        </Text>
        <Text style={entryStyle}>{earnStr}</Text>
      </View>
    </>
  );
}
