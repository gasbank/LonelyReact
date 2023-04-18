import {SummaryEntryWithCallbackProps} from './SummaryEntryProps';
import React, {useEffect, useRef, useState} from 'react';
import {styles} from './App';
import {AppState, Pressable, Text, View} from 'react-native';

export function SummaryEntry(
  props: SummaryEntryWithCallbackProps,
): JSX.Element {
  const [friendlyName, setFriendlyName] = useState('');
  const [closePrice, setClosePrice] = useState<number | undefined>(undefined);
  const [totalPrice, setTotalPrice] = useState<number | undefined>(undefined);
  const [currentRatio, setCurrentRatio] = useState<number | undefined>(
    undefined,
  );
  const [showDetails, setShowDetails] = useState(false);
  const appState = useRef(AppState.currentState);

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
        return await response.json();
      } catch (error) {
        console.error(error);
      }
    };

    const executeAsyncFetch = async (stockId: string) => {
      const data = await fetchDataKr(stockId);
      if (data) {
        setFriendlyName(data.stockName);

        const currentClosePrice = data.closePrice
          ? parseInt(data.closePrice.replace(/,/g, ''), 10)
          : undefined;
        if (currentClosePrice) {
          setClosePrice(currentClosePrice);
          setTotalPrice(currentClosePrice * props.stockCount);
          if (avgPrice !== 0) {
            setCurrentRatio(currentClosePrice / avgPrice - 1);
          }
        } else {
          setClosePrice(undefined);
        }
      }
    };

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        executeAsyncFetch(props.stockName).then(() => {});
      }

      appState.current = nextAppState;
      //setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
    });

    executeAsyncFetch(props.stockName).then(() => {});

    const interval = setInterval(() => {
      executeAsyncFetch(props.stockName).then(() => {});
    }, 2500);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [props.stockName, avgPrice, props.stockCount]);

  const totalDiff = closePrice ? (closePrice - avgPrice) * props.stockCount : 0;

  const currentRatioSafe = currentRatio || 0;
  const currentRatioSafeStr = currentRatioSafe.toLocaleString('ko', {
    style: 'percent',
    minimumFractionDigits: 2,
  });
  const currentRatioSafeStrEmoji = currentRatioSafe > 0 ? '🔥' : '⚠️';

  const detailsSection = showDetails ? (
    <View style={styles.rowContainer}>
      <Text style={styles.flexOne}>
        현재가: {closePrice ? closePrice.toLocaleString('ko') : '???'}원
      </Text>
      <Text style={styles.flexOne}>평단가: {avgPriceStr}원</Text>
      <Text style={styles.flexOne}>확정수익: {fixedIncomeStr}원</Text>
    </View>
  ) : (
    <></>
  );

  function onPress() {
    setShowDetails(!showDetails);
    props.onSelect(props.stockName);
  }

  return (
    <Pressable onPress={onPress}>
      <View style={styles.colContainer}>
        <View style={[styles.rowContainer, styles.gap10]}>
          <View style={styles.colContainer}>
            <Text style={[styles.flexOne, styles.stockName]}>
              {friendlyName} {props.stockCount.toLocaleString('ko')}주
            </Text>

            <Text style={[styles.totalPrice]}>
              {(totalPrice || 0).toLocaleString('ko')}원
            </Text>
          </View>
          <View style={styles.colContainer}>
            <Text style={styles.flexOne}>
              {currentRatioSafeStrEmoji} {currentRatioSafeStr}
            </Text>
            <Text style={styles.flexOne}>
              {(totalDiff || 0).toLocaleString('ko')}원
            </Text>
          </View>
        </View>
        {detailsSection}
      </View>
    </Pressable>
  );
}
