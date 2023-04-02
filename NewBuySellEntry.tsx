import {NewBuySellEntryProps} from './NewBuySellEntryProps';
import React, {forwardRef, useEffect, useState} from 'react';
import {BuySellType} from './BuySellType';
import {styles} from './App';
import {Button, NativeEventEmitter, TextInput, View} from 'react-native';

export const NewBuySellEntry = forwardRef((props: NewBuySellEntryProps, _) => {
  const [stockName, setStockName] = useState(props.stockName);
  const [stockPrice, setStockPrice] = useState(props.stockPrice);
  const [stockCount, setStockCount] = useState(props.stockCount);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter();
    const eventListener = eventEmitter.addListener(
      'onStockNameSelected',
      event => {
        console.log('event received');
        setStockName(event);
      },
    );
    return () => {
      eventListener.remove();
    };
  });

  function onPress(transactionType: BuySellType) {
    if (!stockName || !stockPrice || !stockCount) {
      return;
    }

    props.addFunc({
      key: -1,
      buySellType: transactionType,
      transactionDate: new Date(),
      stockName: stockName,
      stockPrice: stockPrice,
      stockCount: stockCount,
    });
    setStockName(undefined);
    setStockPrice(undefined);
    setStockCount(undefined);
  }

  return (
    <>
      <View style={styles.rowContainer}>
        <TextInput
          placeholder="종목명"
          value={stockName}
          onChangeText={setStockName}
          style={styles.flexOne}
        />
        <TextInput
          placeholder="가격"
          value={stockPrice?.toString()}
          onChangeText={v => setStockPrice(parseInt(v, 10) || undefined)}
          keyboardType="number-pad"
          style={styles.flexOne}
        />
        <TextInput
          placeholder="수량"
          value={stockCount?.toString()}
          onChangeText={v => setStockCount(parseInt(v, 10) || undefined)}
          keyboardType="number-pad"
          style={styles.flexOne}
        />
      </View>
      <View style={styles.rowContainer}>
        <View style={styles.flexOne}>
          <Button
            title="매수"
            onPress={_ => onPress(BuySellType.Buy)}
            color="red"
          />
        </View>

        <View style={styles.flexOne}>
          <Button
            title="매도"
            onPress={_ => onPress(BuySellType.Sell)}
            color="blue"
          />
        </View>
      </View>
    </>
  );
});
