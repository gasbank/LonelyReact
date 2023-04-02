import {BuySellEntryProps} from './BuySellEntryProps';
import {SummaryEntry, SummaryEntryProps} from './SummaryEntryProps';
import {BuySellType} from './BuySellType';
import React, {useEffect, useState} from 'react';
import {NewBuySellEntry} from './NewBuySellEntry';
import {BuySellEntry} from './BuySellEntry';
import {styles} from './App';
import {Button, Text} from 'react-native';
import SQLite, {
  ResultSet,
  SQLError,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';
import {Summary} from './Summary';

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

    let summaryEntry: SummaryEntryProps =
      newSummaryDict.get(e.stockName) || new SummaryEntry(e.stockName);

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

function query(db: SQLiteDatabase, sqlStatement: string, args: any[]) {
  return new Promise<ResultSet>((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          sqlStatement,
          args,
          (transaction, resultSet) => {
            resolve(resultSet);
          },
          (transaction, error) => {
            reject(error);
          },
        );
      },
      error => {
        reject(error);
      },
    );
  });
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

  useEffect(() => {
    //SQLite.enablePromise(true);
    const db = SQLite.openDatabase(
      {name: 'LonelyDb'},
      okCallback,
      errorCallback,
    );

    async function okCallback() {
      console.log('Sqlite ok');

      const result1 = await query(
        db,
        'DROP TABLE IF EXISTS BuySellHistory;',
        [],
      );
      console.log(result1);

      const result2 = await query(
        db,
        `CREATE TABLE BuySellHistory
              (
                  Id              INTEGER PRIMARY KEY,
                  TransactionDate DateTime,
                  StockName       TEXT    NOT NULL,
                  StockCount      INTEGER NOT NULL,
                  StockPrice      INTEGER NOT NULL
              );`,
        [],
      );
      console.log(result2);

      const result3 = await query(
        db,
        "insert into BuySellHistory (TransactionDate, StockName, StockCount, StockPrice) VALUES ('2022-05-06', 'a', 1, 1000);",
        [],
      );
      console.log(result3);

      const result4 = await query(db, 'SELECT * FROM BuySellHistory;', []);
      console.log(result4);

      console.log('Sqlite result 2');
      console.log(JSON.stringify(result4));
      let curHistoryList: BuySellEntryProps[] = [];
      let curSummaryDict: Map<string, SummaryEntryProps> = new Map();
      for (let i = 0; i < result4.rows.length; i++) {
        const item = result4.rows.item(i);

        console.log(JSON.stringify(item));

        const r = addFunc(curHistoryList, curSummaryDict, {
          buySellType: BuySellType.Buy,
          key: item.Id,
          stockName: item.StockName,
          stockPrice: item.StockPrice,
          stockCount: item.StockCount,
          transactionDate: new Date(item.TransactionDate),
        });
        if (r) {
          curHistoryList = r.newHistoryList;
          curSummaryDict = r.newSummaryDict;
        }
      }

      setHistoryList(curHistoryList);
      setSummaryDict(curSummaryDict);
    }

    function errorCallback(e: SQLError) {
      console.error('Sqlite error');
      console.error(e);
    }
  }, []);

  return (
    <>
      <Summary summaryDict={summaryDict} />
      <Text style={styles.sectionTitle}>기록</Text>

      <NewBuySellEntry key={12345} addFunc={addFuncInternal} />
      {historyList
        .slice(0)
        .reverse()
        .map(e => (
          <BuySellEntry
            key={e.key}
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
