import {SummaryEntryProps} from './SummaryEntryProps';

export interface SummaryProps {
  summaryDict: Map<string, SummaryEntryProps>;
  onSelect: (stockName: string) => void;
}
