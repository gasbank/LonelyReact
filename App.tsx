/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

interface BuySellEntryProps {
  buySellType?: BuySellType; // 산 건지 판 건지
  transactionDate?: Date; // 언제
  stockName?: string; // 어떤 종목을
  stockPrice?: number; // 얼마에
  stockCount?: number; // 몇 주나
  earn?: number; // 매도로 인해 얼마나 벌었는지
}

interface NewBuySellEntryProps extends BuySellEntryProps {
  addFunc: (entryProps: BuySellEntryProps) => void;
}

function BuySellEntry(props: BuySellEntryProps): JSX.Element {
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

enum BuySellType {
  Buy = 1,
  Sell,
}

function NewBuySellEntry(props: NewBuySellEntryProps): JSX.Element {
  const [stockName, setStockName] = useState(props.stockName);
  const [stockPrice, setStockPrice] = useState(props.stockPrice);
  const [stockCount, setStockCount] = useState(props.stockCount);

  function onPress(transactionType: BuySellType) {
    if (!stockName || !stockPrice || !stockCount) {
      return;
    }

    props.addFunc({
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
          onChangeText={v => setStockName(v)}
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
}

interface SummaryProps {
  summaryDict: Map<string, SummaryEntryProps>;
}

interface SummaryEntryProps {
  stockName: string;
  stockCount: number;
  accumPrice: number;
  accumBuyPrice: number;
  accumSellPrice: number;
  accumBuyCount: number;
  accumSellCount: number;
  accumEarn: number;
}

function SummaryEntry(props: SummaryEntryProps): JSX.Element {
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
  );
}

function Summary(props: SummaryProps): JSX.Element {
  const historyEntryList = Array.from(props.summaryDict.entries()).map(e => {
    return (
      <SummaryEntry
        stockName={e[1].stockName}
        stockCount={e[1].stockCount}
        accumPrice={e[1].accumPrice}
        accumBuyPrice={e[1].accumBuyPrice}
        accumBuyCount={e[1].accumBuyCount}
        accumSellPrice={e[1].accumSellPrice}
        accumSellCount={e[1].accumSellCount}
        accumEarn={e[1].accumEarn}
      />
    );
  });

  return <>{historyEntryList}</>;
}

function addFunc(
  history: BuySellEntryProps[],
  summaryDict: Map<string, SummaryEntryProps>,
  entryProps: BuySellEntryProps,
) {
  if (
    !entryProps.stockName ||
    !entryProps.stockCount ||
    !entryProps.stockPrice
  ) {
    console.error('입력 값 잘못됨');
    return;
  }

  if (entryProps.stockPrice <= 0 || entryProps.stockCount <= 0) {
    console.error('음수 입력 불가');
    return;
  }

  if (
    entryProps.buySellType === BuySellType.Sell &&
    (summaryDict.get(entryProps.stockName)?.stockCount || 0) <
      entryProps.stockCount
  ) {
    console.error('가진 것보다 더 팔 수 없음');
    return;
  }

  if (entryProps.buySellType === BuySellType.Sell) {
    const summary = summaryDict.get(entryProps.stockName);
    if (summary) {
      entryProps.earn =
        (entryProps.stockPrice - summary.accumPrice / summary.stockCount) *
        entryProps.stockCount;
    }
  }
  const newHistoryList = [...history, entryProps];
  const newSummaryDict = refreshSummary(newHistoryList);

  console.log(newSummaryDict);

  return {newHistoryList, newSummaryDict};
}

function refreshSummary(newHistoryList: BuySellEntryProps[]) {
  const newSummaryDict = new Map<string, SummaryEntryProps>();

  newHistoryList.forEach(e => {
    if (!e.stockName || !e.stockCount || !e.stockPrice) {
      return;
    }

    let summaryEntry: SummaryEntryProps = newSummaryDict.get(e.stockName) || {
      stockName: e.stockName,
      stockCount: 0,
      accumPrice: 0,
      accumBuyPrice: 0,
      accumSellPrice: 0,
      accumBuyCount: 0,
      accumSellCount: 0,
      accumEarn: 0,
    };

    if (e.buySellType === BuySellType.Buy) {
      summaryEntry.accumPrice += e.stockCount * e.stockPrice;
      summaryEntry.stockCount += e.stockCount;

      summaryEntry.accumBuyPrice += e.stockCount * e.stockPrice;
      summaryEntry.accumBuyCount += e.stockCount;
    } else if (e.buySellType === BuySellType.Sell) {
      summaryEntry.accumPrice -=
        e.stockCount * (summaryEntry.accumPrice / summaryEntry.stockCount);
      summaryEntry.stockCount -= e.stockCount;

      summaryEntry.accumSellPrice += e.stockCount * e.stockPrice;
      summaryEntry.accumSellCount += e.stockCount;
      summaryEntry.accumEarn += e.earn || 0;
    }

    newSummaryDict.set(e.stockName, summaryEntry);
  });

  return newSummaryDict;
}

function BuySellHistory(): JSX.Element {
  const [historyList, setHistoryList] = useState<BuySellEntryProps[]>([]);
  const [summaryDict, setSummaryDict] = useState<
    Map<string, SummaryEntryProps>
  >(new Map());

  function refreshEarn() {
    const oldHistoryList = historyList;
    clearAll();

    let newHistoryList: BuySellEntryProps[] = [];
    let newSummaryDict = new Map<string, SummaryEntryProps>();

    for (let v of oldHistoryList) {
      const r = addFunc(newHistoryList, newSummaryDict, v);
      if (r) {
        newHistoryList = r.newHistoryList;
        newSummaryDict = r.newSummaryDict;
      }
    }
    setHistoryList(newHistoryList);
    setSummaryDict(newSummaryDict);
  }

  function clearAll() {
    setHistoryList([]);
    setSummaryDict(new Map());
  }

  function addFuncInternal(entryProps: BuySellEntryProps) {
    const r = addFunc(historyList, summaryDict, entryProps);
    if (r) {
      setHistoryList(r.newHistoryList);
      setSummaryDict(r.newSummaryDict);
    }
  }

  return (
    <>
      <Summary summaryDict={summaryDict} />

      <Text style={styles.sectionTitle}>기록</Text>

      <NewBuySellEntry addFunc={addFuncInternal} />
      {historyList
        .slice(0)
        .reverse()
        .map(e => (
          <BuySellEntry
            buySellType={e.buySellType}
            transactionDate={e.transactionDate}
            stockName={e.stockName}
            stockPrice={e.stockPrice}
            stockCount={e.stockCount}
            earn={e.earn}
          />
        ))}
      <Button title="수익 일괄 재계산" onPress={refreshEarn} />
      <Button title="모든 기록 삭제" onPress={clearAll} />
    </>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Text style={styles.sectionTitle}>잔고</Text>
        <BuySellHistory />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  container: {
    flex: 1,
    padding: 5,
  },
  rowContainer: {
    flex: 1,
    padding: 5,
    flexDirection: 'row',
  },
  colContainer: {
    flex: 1,
    padding: 0,
    flexDirection: 'column',
  },
  flexOne: {
    flex: 1,
  },
  flexHalf: {
    flex: 0.5,
  },
});

export default App;
