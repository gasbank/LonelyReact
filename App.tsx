/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import type {PropsWithChildren} from 'react';
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

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

interface BuySellEntryProps {
  buySellType?: BuySellType;
  transactionDate?: Date;
  stockName?: string;
  stockPrice?: number;
  stockCount?: number;
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

  return (
    <>
      <View style={[buySellStyles.container, {flexDirection: 'row'}]}>
        <Text style={{flex: 1, color: textColor}}>
          {props.transactionDate?.toLocaleDateString('ko') || '---'}
        </Text>
        <Text style={{flex: 1, color: textColor}}>{props.stockName}</Text>
        <Text style={{flex: 1, color: textColor}}>
          {props.stockPrice?.toLocaleString('ko')}원
        </Text>
        <Text style={{flex: 1, color: textColor}}>
          {props.stockCount?.toLocaleString('ko')}주
        </Text>
      </View>
    </>
  );
}

const buySellStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
});

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
      <View style={[buySellStyles.container, {flexDirection: 'row'}]}>
        <TextInput
          placeholder="종목명"
          value={stockName}
          onChangeText={v => setStockName(v)}
          style={{flex: 1}}
        />
        <TextInput
          placeholder="가격"
          value={stockPrice?.toString()}
          onChangeText={v => setStockPrice(parseInt(v, 10) || undefined)}
          keyboardType="number-pad"
          style={{flex: 1}}
        />
        <TextInput
          placeholder="수량"
          value={stockCount?.toString()}
          onChangeText={v => setStockCount(parseInt(v, 10) || undefined)}
          keyboardType="number-pad"
          style={{flex: 1}}
        />
      </View>
      <View style={[buySellStyles.container, {flexDirection: 'row'}]}>
        <View style={{flex: 1}}>
          <Button
            title="매수"
            onPress={_ => onPress(BuySellType.Buy)}
            color="red"
          />
        </View>

        <View style={{flex: 1}}>
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
  historyList: BuySellEntryProps[];
}

interface SummaryEntryProps {
  stockName: string;
  stockCount: number;
  accumPrice: number;
}

function SummaryEntry(props: SummaryEntryProps): JSX.Element {
  return (
    <>
      <Text>{props.stockName}</Text>
      <Text>{props.stockCount}주</Text>
      <Text>평단가: {(props.accumPrice / props.stockCount).toLocaleString('ko', {maximumFractionDigits: 0})}원</Text>
    </>
  );
}

function Summary(props: SummaryProps): JSX.Element {
  const historyDict = new Map<string, SummaryEntryProps>();

  props.historyList.forEach(e => {
    if (!e.stockName || !e.stockCount || !e.stockPrice) {
      return;
    }

    let summaryEntry = historyDict.get(e.stockName) || {
      stockName: e.stockName,
      stockCount: 0,
      accumPrice: 0,
    };

    if (e.buySellType === BuySellType.Buy) {
      summaryEntry.stockCount += e.stockCount;
      summaryEntry.accumPrice += e.stockCount * e.stockPrice;
    } else if (e.buySellType === BuySellType.Sell) {
      summaryEntry.stockCount -= e.stockCount;
      summaryEntry.accumPrice -= e.stockCount * e.stockPrice;
    }

    historyDict.set(e.stockName, summaryEntry);
  });

  const historyEntryList = Array.from(historyDict.entries()).map(e => {
    return (
      <SummaryEntry
        stockName={e[1].stockName}
        stockCount={e[1].stockCount}
        accumPrice={e[1].accumPrice}
      />
    );
  });

  return <>{historyEntryList}</>;
}

function BuySellHistory(): JSX.Element {
  const [historyList, setHistoryList] = useState<BuySellEntryProps[]>([]);

  function addFunc(entryProps: BuySellEntryProps) {
    setHistoryList([...historyList, entryProps]);
  }

  return (
    <>
      <Summary historyList={historyList} />
      <Text>매수, 매도 히스토리가 여기 나옵니다~ 최신 거래가 맨 위에!</Text>
      <NewBuySellEntry addFunc={addFunc} />
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
          />
        ))}
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
        <Text>설마 이것도 바로 되는 건가?</Text>
        <BuySellHistory />
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
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
});

export default App;
