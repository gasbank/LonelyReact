import {BuySellEntryProps} from './BuySellEntryProps';
import {SummaryEntryProps} from './SummaryEntryProps';
import {BuySellType} from './BuySellType';
import React, {useState} from 'react';
import {Summary} from './Summary';
import {NewBuySellEntry} from './NewBuySellEntry';
import {BuySellEntry} from './BuySellEntry';
import {styles} from './App';
import {Text, Button} from 'react-native';

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

export function BuySellHistory(): JSX.Element {
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

      <NewBuySellEntry key="" addFunc={addFuncInternal} />
      {historyList
        .slice(0)
        .reverse()
        .map(e => (
          <BuySellEntry
            key="xxx"
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
