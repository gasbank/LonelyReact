import { BuySellEntryProps } from "./BuySellEntryProps";

export interface NewBuySellEntryProps extends BuySellEntryProps {
  addFunc: (entryProps: BuySellEntryProps) => void;
}
