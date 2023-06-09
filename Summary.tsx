import {SummaryProps} from './SummaryProps';
import {SummaryEntry} from './SummaryEntry';
import React from 'react';
import {View} from 'react-native';

export function Summary(props: SummaryProps): JSX.Element {
  //console.log(`props.summaryDict.size = ${props.summaryDict.size}`);
  const historyEntryList = Array.from(props.summaryDict.entries())
    .filter(e => e[1].stockCount > 0)
    .map(e => {
      return (
        <SummaryEntry
          key={e[1].stockName}
          stockName={e[1].stockName}
          stockCount={e[1].stockCount}
          accumPrice={e[1].accumPrice}
          accumBuyPrice={e[1].accumBuyPrice}
          accumBuyCount={e[1].accumBuyCount}
          accumSellPrice={e[1].accumSellPrice}
          accumSellCount={e[1].accumSellCount}
          accumEarn={e[1].accumEarn}
          onSelect={props.onSelect}
        />
      );
    });

  return (
    <>
      <View>{historyEntryList}</View>
    </>
  );
}
