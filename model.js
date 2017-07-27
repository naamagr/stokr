(function () {

  'use strict';
  window.Stockr = window.Stockr || {};


  let uiState = {
    currentLayout: 'home',
    currentChangeViewIndex: 0,
    filtersValues: {
      byName: '',
      byGain: 'All',
      byRangeFrom: '',
      byRangeTo: ''
    },
    displayedStocksSymbols: ['WIX', 'GOOG', 'MSFT']
  };

  let stockData = [];

  window.Stockr.model = {

    getUiState(){
      return uiState
    },

    setUiState(newUiState){
      uiState = newUiState
    },

    getDisplayedStocksSymbols(){
      return uiState.displayedStocksSymbols
    },

    setDisplayedStocksSymbols(stocks){
      uiState.displayedStocksSymbols = stocks
    },

    getStocksData() {
      return stockData;
    },

    getStock(index) {
      return stockData[index];
    },

    getCurrentLayout() {
      return uiState.currentLayout;
    },

    getCurrentChangeViewIndex() {
      return uiState.currentChangeViewIndex;
    },

    getStockIndex(symbol){
      return stockData.findIndex(x => x.Symbol === symbol);
    },

    setStock(index, stock){
      stockData[index] = stock;
      console.log(`place ${stock.Symbol} in index ${index}`);
    },

    setStockData(stocks){
      stockData = stocks;
      console.log(`set stocks ${stockData}`);
    },

    setCurrentLayout(layout) {
      uiState.currentLayout = layout;
    },

    setCurrentChangeViewIndex(index) {
      uiState.currentChangeViewIndex = index;
    },

    setFilterValues(filters) {
      uiState.filtersValues = filters
    },

    getFilterValues() {
      return uiState.filtersValues
    }
  }

}());
