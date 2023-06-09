import {BuySellEntryProps} from './BuySellEntryProps';
import {SummaryData, SummaryEntryProps} from './SummaryEntryProps';
import {BuySellType} from './BuySellType';
import React, {useEffect, useRef, useState} from 'react';
import {styles} from './App';
import {
  Button,
  Modal,
  NativeEventEmitter,
  Pressable,
  Text,
  View,
} from 'react-native';
import SQLite, {
  ResultSet,
  SQLError,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';
import {Summary} from './Summary';
import {BuySellEntry} from './BuySellEntry';
import {NewBuySellEntry} from './NewBuySellEntry';

async function addFunc(
  history: BuySellEntryProps[],
  summaryDict: Map<string, SummaryEntryProps>,
  entryProps: BuySellEntryProps,
  db?: SQLiteDatabase,
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

  // 조건 체크는 끝났다~ DB에 써야한다면 쓰자~
  if (db) {
    try {
      const result = await query(
        db,
        'INSERT INTO BuySellHistory (BuySellType, TransactionDate, StockName, StockCount, StockPrice) VALUES (?, ?, ?, ?, ?)',
        [
          entryProps.buySellType?.toString() || 'error',
          new Date().toString(),
          entryProps.stockName,
          entryProps.stockCount,
          entryProps.stockPrice,
        ],
      );
      entryProps.key = result.insertId;
      console.log('-----');
      console.log(JSON.stringify(result));
    } catch (e) {
      console.error(e);
    }
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

  //console.log(newSummaryDict);

  return {newHistoryList, newSummaryDict};
}

function refreshSummary(newHistoryList: BuySellEntryProps[]) {
  const newSummaryDict = new Map<string, SummaryEntryProps>();

  newHistoryList.forEach(e => {
    if (!e.stockName || !e.stockCount || !e.stockPrice) {
      return;
    }

    let summaryEntry: SummaryEntryProps =
      newSummaryDict.get(e.stockName) || new SummaryData(e.stockName);

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

async function query(db: SQLiteDatabase, sqlStatement: string, args: any[]) {
  console.log(db);
  return new Promise<ResultSet>(async (resolve, reject) => {
    try {
      await db.transaction(async tx => {
        console.log(tx);
        const result = await tx.executeSql(sqlStatement, args);
        if (result) {
          console.log(result[1]);
        } else {
          console.log('result empty');
        }
        resolve(result[1]);
      });
    } catch (error) {
      reject(error);
    }
  });

  // const tx = await db.transaction(_ => {});
  // console.log(tx);
  // const r = await tx.executeSql(sqlStatement, args);
  // return r[1];

  // return new Promise<ResultSet>(resolve => {
  //   db.transaction(
  //     tx => {
  //       tx.executeSql(
  //         sqlStatement,
  //         args,
  //         (transaction, resultSet) => {
  //           console.log('oh 3');
  //           resolve(resultSet);
  //         },
  //         (transaction, error) => {
  //           console.log('oh 2');
  //           //reject(error);
  //           throw error;
  //         },
  //       );
  //     },
  //     error => {
  //       console.log('oh 100');
  //       console.log(JSON.stringify(error));
  //       //reject(error);
  //       throw error;
  //     },
  //   );
  // });
}

export function BuySellHistory(): JSX.Element {
  const [historyList, setHistoryList] = useState<BuySellEntryProps[]>([]);
  const [summaryDict, setSummaryDict] = useState<
    Map<string, SummaryEntryProps>
  >(new Map());
  const [clearAllModalVisible, setClearAllModalVisible] = useState(false);
  const db = useRef<SQLiteDatabase>();
  const [dbLoadedCount, setDbLoadedCount] = useState(0);

  // async function refreshEarn() {
  //   const oldHistoryList = historyList;
  //   clearStateOnly();
  //
  //   let newHistoryList: BuySellEntryProps[] = [];
  //   let newSummaryDict = new Map<string, SummaryEntryProps>();
  //
  //   for (let v of oldHistoryList) {
  //     const r = addFunc(newHistoryList, newSummaryDict, v);
  //     if (r) {
  //       newHistoryList = r.newHistoryList;
  //       newSummaryDict = r.newSummaryDict;
  //     }
  //   }
  //   setHistoryList(newHistoryList);
  //   setSummaryDict(newSummaryDict);
  // }

  async function clearAll() {
    await recreateTable();
    clearStateOnly();
  }

  function clearStateOnly() {
    setHistoryList([]);
    setSummaryDict(new Map());
  }

  async function addFuncAndWriteToDb(entryProps: BuySellEntryProps) {
    const r = await addFunc(historyList, summaryDict, entryProps, db.current);
    if (r) {
      setHistoryList(r.newHistoryList);
      setSummaryDict(r.newSummaryDict);
    }
  }

  async function createBuySellHistoryTableIfNotExists() {
    if (!db.current) {
      console.error('db not ready');
      return;
    }

    console.log(
      await query(
        db.current,
        `CREATE TABLE IF NOT EXISTS BuySellHistory
       (
           Id              INTEGER PRIMARY KEY,
           BuySellType     TEXT    NOT NULL,
           TransactionDate DateTime,
           StockName       TEXT    NOT NULL,
           StockCount      INTEGER NOT NULL,
           StockPrice      INTEGER NOT NULL
       );`,
        [],
      ),
    );
  }

  async function createStockAccountTableIfNotExists() {
    if (!db.current) {
      console.error('db not ready');
      return;
    }

    console.log(
      await query(
        db.current,
        `CREATE TABLE IF NOT EXISTS StockAccount
       (
           Id              INTEGER PRIMARY KEY,
           AccountName     TEXT    NOT NULL
       );`,
        [],
      ),
    );
  }

  async function dropAllTablesIfExist() {
    if (!db.current) {
      console.error('db not ready');
      return;
    }

    console.log(
      await query(db.current, 'DROP TABLE IF EXISTS BuySellHistory;', []),
    );

    console.log(
      await query(db.current, 'DROP TABLE IF EXISTS StockAccount;', []),
    );
  }

  async function addAccountIdColumn() {
    if (!db.current) {
      console.error('db not ready');
      return;
    }

    try {
      console.log(
        await query(
          db.current,
          'ALTER TABLE BuySellHistory ADD AccountId INTEGER;',
          [],
        ),
      );
    } catch (e) {
      console.error('here it comes~');
      if (e) {
        console.error(JSON.stringify(e));
      } else {
        console.error('undefined error...');
      }
    }
  }

  async function createAllTablesAndMigrate() {
    await createBuySellHistoryTableIfNotExists();
    await createStockAccountTableIfNotExists();
    await addAccountIdColumn();
  }

  async function recreateTable() {
    await dropAllTablesIfExist();
    await createAllTablesAndMigrate();
  }

  useEffect(() => {
    SQLite.DEBUG(true);
    SQLite.enablePromise(true);

    async function startDb() {
      db.current = await SQLite.openDatabase({name: 'Lonely.db'});
      if (!db.current) {
        console.error('db.current null');
        return;
      }
      await createAllTablesAndMigrate();

      const selectResult = await query(
        db.current,
        'SELECT * FROM BuySellHistory;',
        [],
      );
      //console.log(selectResult);

      setDbLoadedCount(selectResult.rows.length);

      //console.log('Sqlite result 2');
      //console.log(JSON.stringify(selectResult));
      let curHistoryList: BuySellEntryProps[] = [];
      let curSummaryDict: Map<string, SummaryEntryProps> = new Map();
      for (let i = 0; i < selectResult.rows.length; i++) {
        const item = selectResult.rows.item(i);

        //console.log(JSON.stringify(item));

        const r = await addFunc(curHistoryList, curSummaryDict, {
          buySellType: parseInt(item.BuySellType, 10),
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

    startDb().then(_ => {});

    return;

    db.current = SQLite.openDatabase(
      {name: 'Lonely.db'},
      okCallback,
      errorCallback,
    );

    async function okCallback() {
      if (!db.current) {
        console.error('db.current null');
        return;
      }
      //console.log('Sqlite ok');

      await createAllTablesAndMigrate();

      const selectResult = await query(
        db.current,
        'SELECT * FROM BuySellHistory;',
        [],
      );
      //console.log(selectResult);

      setDbLoadedCount(selectResult.rows.length);

      //console.log('Sqlite result 2');
      //console.log(JSON.stringify(selectResult));
      let curHistoryList: BuySellEntryProps[] = [];
      let curSummaryDict: Map<string, SummaryEntryProps> = new Map();
      for (let i = 0; i < selectResult.rows.length; i++) {
        const item = selectResult.rows.item(i);

        //console.log(JSON.stringify(item));

        const r = await addFunc(curHistoryList, curSummaryDict, {
          buySellType: parseInt(item.BuySellType, 10),
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

    if (newBuySellEntryRef.current) {
      //newBuySellEntryRef.current.;
    }
  }, []);

  function onSelectStockSummary(stockName: string) {
    // console.log(`Stock summary selected: '${stockName}'`);
    const eventEmitter = new NativeEventEmitter();
    eventEmitter.emit('onStockNameSelected', stockName);
  }

  const newBuySellEntryRef = useRef<JSX.Element>();

  return (
    <>
      {/*<Text style={styles.sectionTitle}>잔고</Text>*/}
      <Summary summaryDict={summaryDict} onSelect={onSelectStockSummary} />

      {/*<Text style={styles.sectionTitle}>기록</Text>*/}

      <NewBuySellEntry
        key={12345}
        addFunc={addFuncAndWriteToDb}
        ref={newBuySellEntryRef}
      />
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
      {/*<Button title="수익 일괄 재계산" onPress={refreshEarn} />*/}
      <Button
        title="모든 기록 삭제"
        onPress={() => {
          setClearAllModalVisible(true);
          console.log('clicked');
        }}
      />
      <Text>DB Loaded Count: {dbLoadedCount}</Text>

      <Modal
        animationType="none"
        transparent={true}
        visible={clearAllModalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>정말 모든 기록을 삭제할까요?!?!</Text>
            <Pressable
              style={[styles.button, styles.buttonOpen]}
              onPress={async () => {
                await clearAll();
                setClearAllModalVisible(false);
              }}>
              <Text>삭제!!!</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setClearAllModalVisible(false)}>
              <Text>취소 취소 취소~~~</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
