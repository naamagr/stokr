(function () {

  'use strict';
  window.Stockr = window.Stockr || {};


  let uiState = {

    currentLayout: 'home',
    currentChangeViewIndex: 0
  };

  let stockData =[];

  window.Stockr.model = {

    getStocksData() {return stockData;},

    getStock(index) {return stockData[index];},

    getCurrentLayout() {return uiState.currentLayout;},

    getCurrentChangeViewIndex() { return uiState.currentChangeViewIndex;},

    getStockIndex(symbol){return stockData.findIndex(x => x.Symbol === symbol);},

    setStock(index,stock){stockData[index] = stock; console.log(`place ${stock.Symbol} in index ${index}`);},

    setStockData(stocks){stockData = stocks;console.log(`set stocks ${stockData}`);},

    setCurrentLayout(layout) {uiState.currentLayout = layout;},

    setCurrentChangeViewIndex(index) {uiState.currentChangeViewIndex = index;},
  }

}())
