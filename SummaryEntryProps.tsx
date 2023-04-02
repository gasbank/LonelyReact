export interface SummaryEntryProps {
  key: string;
  stockName: string;
  stockCount: number;
  accumPrice: number;
  accumBuyPrice: number;
  accumSellPrice: number;
  accumBuyCount: number;
  accumSellCount: number;
  accumEarn: number;
}

export class SummaryEntry implements SummaryEntryProps {
  accumBuyCount: number = 0;
  accumBuyPrice: number = 0;
  accumEarn: number = 0;
  accumPrice: number = 0;
  accumSellCount: number = 0;
  accumSellPrice: number = 0;
  key: string = '';
  stockCount: number = 0;
  stockName: string = '';

  constructor(stockName: string) {
    this.stockName = stockName;
  }
}
