(function () {

  const SERVER_URL = 'http://localhost:7000';
  const REQUEST_URL = '/quotes?q=';
  const SEARCH_URL = '/search?q=';

  'use strict';

  window.Stockr = window.Stockr || {};

  const Model = window.Stockr.model;
  const View = window.Stockr.view;

  const layouts = {
    'home': 'home',
    'filter': 'filter',
    'settings': 'settings',
    'search': 'search'
  };

  function parseServerResponse(response) {
    console.log(response);
    let res = [];

    if (Object.prototype.toString.call(response) !== '[object Array]') {
      res.push(parseOneStock(response));
      return res;
    }

    response.forEach((stock) => {
      res.push(parseOneStock(stock));
    });
    return res;
  }

  function parseOneStock(stock) {
    let newStock = {};
    newStock.Symbol = stock.Symbol;
    newStock.Name = stock.Name;
    newStock.LastTradePriceOnly = stock.LastTradePriceOnly;
    newStock.MarketCapitalization = stock.MarketCapitalization.slice(0, -1);
    newStock.Change = stock.realtime_change;
    newStock.PercentChange = stock.realtime_chg_percent;
    return newStock;
  }

  const changeModes = ['change', 'percent', 'capital'];

  let displayedStocks = [];


  function filterStocks(filterFields) {
    debugger;
    if (!filterFields) {
      filterFields = Model.getFilterValues();
    }
    saveFilterFields(filterFields);
    displayedStocks = JSON.parse(JSON.stringify(Model.getStocksData()));
    filterStocksByName(filterFields.byName);
    filterStocksByGain(filterFields.byGain);
    filterStocksByRangeFrom(filterFields.byRangeFrom);
    filterStocksByRangeTo(filterFields.byRangeTo);
    return displayedStocks;
  }

  function saveFilterFields(filterFields) {
    const filters = {};
    filters.byName = filterFields.byName;
    filters.byGain = filterFields.byGain;
    filters.byRangeFrom = filterFields.byRangeFrom;
    filters.byRangeTo = filterFields.byRangeTo;
    Model.setFilterValues(filters);
    saveUiState();
  }

  function filterStocksByName(name) {
    console.log('filterStocksByName');
    if (name) {
      name = name.toUpperCase();
      displayedStocks = displayedStocks.filter((stock) => {
        return (stock.Symbol.toUpperCase().includes(name) || stock.Name.toUpperCase().includes(name))
      })
    }
    console.dir(displayedStocks);
  }

  function filterStocksByGain(gain) {
    console.log('filterStocksByGain');

    if (gain === 'losing') {
      displayedStocks = displayedStocks.filter((stock) => {
        return (stock.PercentChange[0] === '-')
      })
    }

    else if (gain === 'gaining') {
      displayedStocks = displayedStocks.filter((stock) => {
        return (stock.PercentChange[0] === '+')
      })
    }
    console.dir(displayedStocks);
  }

  function filterStocksByRangeFrom(rangeFrom) {
    if (rangeFrom !== '') {
      rangeFrom = rangeFrom.replace('%', '');
      displayedStocks = displayedStocks.filter((stock) => {
        const trend = stock.PercentChange.replace('%', '');
        return (parseFloat(trend) > rangeFrom);
      });
    }
  }

  function filterStocksByRangeTo(rangeTo) {
    if (rangeTo !== '') {
      rangeTo = rangeTo.replace('%', '');
      displayedStocks = displayedStocks.filter((stock) => {
        const trend = stock.PercentChange.replace('%', '');
        return (parseFloat(trend) < rangeTo);
      });
    }
  }


  function swapStocks(symbol, upDown) {
    const index1 = Model.getStockIndex(symbol);
    const index2 = upDown === 'up' ? index1 - 1 : index1 + 1;
    console.log(`switching ${index1} with ${index2}`);

    swapItems(Model.getStocksData(), index1, index2);
    swapItems(Model.getDisplayedStocksSymbols(), index1, index2);
    renderMain(Model.getStocksData());

    saveUiState();
  }

  function swapItems(array, index1, index2) {
    let temp = array[index2];
    array[index2] = array[index1];
    array[index1] = temp;
  }


  function changeButtonClick() {
    Model.setCurrentChangeViewIndex((Model.getCurrentChangeViewIndex() + 1) % 3);
    console.log(`changePercentageView: ${changeModes[Model.getCurrentChangeViewIndex()]}`);
    renderMain(Model.getStocksData());
    saveUiState();
  }

  function updateFilterLayout() {
    let currentLayout = Model.getCurrentLayout();
    currentLayout = (currentLayout === layouts.home) ? layouts.filter : layouts.home;
    Model.setCurrentLayout(currentLayout);
    renderMain(Model.getStocksData());
    saveUiState();
    console.log(`new layout:${Model.getCurrentLayout()}`);
  }

  function disableInactiveNavBarButtons() {
    const currentLayout = Model.getCurrentLayout();

    if (currentLayout === layouts.home) {
      View.enableAllNavButtons();
    }
    else if (currentLayout === layouts.filter) {
      const appElement = document.querySelector('.app');
      appElement.querySelector('.settings-button').setAttribute("disabled", "true");
      appElement.querySelector('.refresh-button').setAttribute("disabled", "true");
      appElement.querySelector('.search-button').setAttribute("disabled", "true");
    }
  }

  function filterNavButtonClick() {

    toggleDisplayBySelector('.filter-header');

    // toggleDisplayBySelector('.up-down-buttons')

    // turnButtonGreen('.filter-button');

    Controller.updateFilterLayout();

    Controller.disableInactiveNavBarButtons();
  }

  function fetchStocksAndRender(render) {
    // return fetch('mocks/stocks.json')
    return fetch(SERVER_URL + REQUEST_URL + Model.getDisplayedStocksSymbols().toString())
      .then((response) => response.json())
      .then((response) => {
        console.log(response.query.results.quote);

        Model.setStockData(parseServerResponse(response.query.results.quote));

        return Model.getStocksData()
      })
      .then((stocks) => {
        if (render) {
          console.log('refresh');
          renderMain(stocks)
        }
      })
      .catch(function (e) {
        console.log(e);
      });
  }

  function hashChanged(hash) {
    console.log(`hash ${hash}`);
    if (hash) {
      Model.setCurrentLayout(hash);
    }
    else {
      Model.setCurrentLayout('home');
      console.log('no hash');
    }
    renderMain(Model.getStocksData());
    saveUiState();
  }

  function renderMain(stockData) {
    console.log(`renderMain Model.getCurrentChangeViewIndex() ${Model.getCurrentChangeViewIndex()}`);
    const changeMode = changeModes[Model.getCurrentChangeViewIndex()];
    const layout = Model.getCurrentLayout();
    View.renderView(stockData, changeMode, layout, Model.getFilterValues());
  }

  function saveUiState() {
    // localStorage.removeItem('stokr-uiState');
    console.log('saving ui state');
    console.log(Model.getUiState());
    debugger;
    localStorage.setItem('stokr-uiState', JSON.stringify(Model.getUiState()));
    // console.log(JSON.stringify(Model.setUiState()));

  }

  function fetchUiState() {
    const savedUiState = JSON.parse(localStorage.getItem('stokr-uiState'));
    if (savedUiState) {
      Model.setUiState(savedUiState);
    }

  }

  function refreshStocks() {
    console.log('refreshButtonClick');
    // fetchUiState();
    fetchStocksAndRender(true);

  }

  function searchStocks(searchString) {
    return fetch(SERVER_URL + SEARCH_URL + searchString)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        console.log('searchStocks' + data.ResultSet.Result);
        View.renderSearchMain(data.ResultSet.Result);
      })
      .catch(function (e) {
        console.log(e);
      });
  }

  function addSymbolToList(symbol) {
    Model.getDisplayedStocksSymbols().push(symbol);
    fetchStocksAndRender(false);
  }

  function init() {
    fetchUiState();
    fetchStocksAndRender(true);
    window.Stockr.view.addEventListeners();
    setInterval(refreshStocks, 300000);
  }

  window.Stockr.controller = {
    searchStocks: searchStocks,
    swapStocks: swapStocks,
    updateFilterLayout: updateFilterLayout,
    changeButtonClick: changeButtonClick,
    disableInactiveNavBarButtons: disableInactiveNavBarButtons,
    filterStocks: filterStocks,
    hashChanged: hashChanged,
    renderMain: renderMain,
    filterNavButtonClick: filterNavButtonClick,
    refreshButtonClick: refreshStocks,
    addSymbolToList: addSymbolToList,
  };

  init();

}());
