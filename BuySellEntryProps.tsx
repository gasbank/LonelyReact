import {BuySellType} from './BuySellType';

export interface BuySellEntryProps {
  buySellType?: BuySellType; // 산 건지 판 건지
  transactionDate?: Date; // 언제
  stockName?: string; // 어떤 종목을
  stockPrice?: number; // 얼마에
  stockCount?: number; // 몇 주나
  earn?: number; // 매도로 인해 얼마나 벌었는지
}
