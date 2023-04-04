import React, {StrictMode} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {BuySellHistory} from './BuySellHistory';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <StrictMode>
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <Text>고독한 투자자</Text>
        <BuySellHistory />
        {/*<ScrollView*/}
        {/*  contentInsetAdjustmentBehavior="automatic"*/}
        {/*  style={backgroundStyle}>*/}
        {/*</ScrollView>*/}
      </SafeAreaView>
    </StrictMode>
  );
}

export const styles = StyleSheet.create({
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
  rootContainer: {},
  summaryContainer: {
    flex: 1,
  },
  historyContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    flexShrink: 1,
    alignContent: 'flex-start',
  },
  rowContainer: {
    // flex: 1,
    padding: 5,
    flexDirection: 'row',
    flexShrink: 1,
    alignContent: 'flex-start',
  },
  colContainer: {
    // flex: 1,
    padding: 0,
    flexDirection: 'column',
  },
  flexOne: {
    flex: 1,
  },
  flexHalf: {
    flex: 0.5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
});

export default App;
