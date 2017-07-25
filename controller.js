(function () {

  const SERVER_URL = 'http://localhost:7000;';
  const REQUEST_URL = '/quotes';

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

  const changeModes = ['change', 'percent', 'temp'];

  let displayedStocks = [];

  function filterStocks(filterFields) {
    displayedStocks = JSON.parse(JSON.stringify(Model.getStocksData()));
    filterStocksByName(filterFields.byName);
    filterStocksByGain(filterFields.byGain);
    filterStocksByRangeFrom (filterFields.byRangeFrom);
    filterStocksByRangeTo (filterFields.byRangeTo);
    renderMain(displayedStocks);
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
    console.log('filterStocksByRangeFrom');
    if (rangeFrom !== '') {
      rangeFrom = rangeFrom.replace('%', '');
      displayedStocks = displayedStocks.filter((stock) => {
        const trend = stock.PercentChange.replace('%', '');
        return (parseFloat(trend) > rangeFrom);
      });
      console.dir(displayedStocks);
    }
  }

  function filterStocksByRangeTo(rangeTo) {
    if (rangeTo !== '') {
      console.log('filterStocksByRangeTo');
      rangeTo = rangeTo.replace('%', '');
      displayedStocks = displayedStocks.filter((stock) => {
        const trend = stock.PercentChange.replace('%', '');
        return (parseFloat(trend) < rangeTo);
      });
      console.dir(displayedStocks);
    }
  }


  function swapStocks(symbol, upDown) {
    const index1 = Model.getStockIndex(symbol);
    const index2 = upDown === 'up' ? index1 - 1 : index1 + 1;
    console.log(`switching ${index1} with ${index2}`);
    let temp = Model.getStock(index2);
    Model.setStock(index2, Model.getStock(index1));
    Model.setStock(index1, temp);

    renderMain(Model.getStocksData());
  }


  function changeButtonClick() {
    Model.setCurrentChangeViewIndex((Model.getCurrentChangeViewIndex() + 1) % 3);
    console.log(`changePercentageView: ${changeModes[Model.getCurrentChangeViewIndex()]}`);
    renderMain(Model.getStocksData());
  }

  function updateFilterLayout() {
    let currentLayout = Model.getCurrentLayout();
    currentLayout = (currentLayout === layouts.home) ? layouts.filter : layouts.home;
    Model.setCurrentLayout(currentLayout);
    renderMain(Model.getStocksData());

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


  function fetchStocksAndRender() {
    return fetch('mocks/stocks.json')
      .then((response)=> response.json())
      .then((response)=> {
      console.log(response);
         Model.setStockData(response);
        return Model.getStocksData()
    }).then(renderMain).catch(function() {
      console.log('error');
    });
  }


  function renderMain(stockData) {
    console.log(`renderMain Model.getCurrentChangeViewIndex() ${Model.getCurrentChangeViewIndex()}`);
    const changeMode = changeModes[Model.getCurrentChangeViewIndex()];
    const layout = Model.getCurrentLayout();
    View.renderMainElement(stockData, changeMode,layout);
  }

  function init() {
    fetchStocksAndRender();
    window.Stockr.view.addEventListeners();
  }

  window.Stockr.controller = {
    swapStocks: swapStocks,
    updateFilterLayout: updateFilterLayout,
    changeButtonClick: changeButtonClick,
    disableInactiveNavBarButtons: disableInactiveNavBarButtons,
    filterStocks: filterStocks
  };

  init();

}());
