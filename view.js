(function () {

  'use strict';
  window.Stockr = window.Stockr || {};

  var Controller;

  /* private */

  const clickEventHandlers = {
    'change-button': changeButtonClick,
    'up-down-buttons': arrowButtonsClick,
    'filter-nav-button': filterNavButtonClick,
    'refresh-button': refreshButtonClick,
    'apply-filter-button': applyFilterStocks,
    'add-button' : addStockClick
  };

  function applyFilterStocks() {
    let filterFields = {};
    filterFields.byName = document.querySelector('input[id="Name-filter"]').value;
    const gainFilterElement = document.querySelector('select[id="gain-filter"]');
    filterFields.byGain = gainFilterElement.options[gainFilterElement.selectedIndex].value;
    filterFields.byRangeFrom = document.querySelector('input[id="range-from-filter"]').value;
    filterFields.byRangeTo = document.querySelector('input[id="range-to-filter"]').value;
    debugger;
    const filteredStocks = Controller.filterStocks(filterFields);
    Controller.renderMain(filteredStocks);
  }

  function createList(stocks, changeMode) {
    console.log(`createList stocks ${stocks}`);
    return `${stocks.map(function (stock) {
      return createLi(stock, changeMode);
    }).join('')}`
  }

  function createLi(stockItem, changeMode) {
    const lastTradePrice = Math.trunc(stockItem.LastTradePriceOnly * 100) / 100;
    const stockChange = getChangeValue(stockItem, changeMode);
    const changeClass = stockItem.PercentChange[0] === '-' ? 'change-minus' : 'change-plus';

    let li =
      `<li>
          <h2 class="symbol-and-name">
            <span class="symbol">${stockItem.Symbol}</span>
            <span class="stock-name">${stockItem.Name}</span>
          </h2>
          <div class="stock-data">
            <span class="price">${lastTradePrice}</span>
            <button data-type="change-button" class="change ${changeClass}">${stockChange}</button>
              <div class="up-down-buttons">
                <button data-id="${stockItem.Symbol}" data-type="up-down-buttons" class="up-button icon-arrow"></button>
                <button data-id="${stockItem.Symbol}" data-type="up-down-buttons" class="down-button icon-arrow"></button>
              </div>
          </div>
       </li>`;

    return li;
  }

  function getChangeValue(stockItem, changeMode) {
    console.log(`getChangeValue ${changeMode}`);
    if (changeMode === 'change') {
      let res = (Math.trunc(stockItem.Change * 10)) / 10;
      if (res.toString()[0] !== '-') {
        res = '+' + res;
      }
      return res;
    }
    else if (changeMode === 'percent') {
      let res = (Math.trunc(stockItem.PercentChange * 100)) / 100 + '%';
      if (res[0] !== '-') {
        res = '+' + res;
      }
      return res;
    }
    else {
      return `${(Math.trunc(stockItem.MarketCapitalization * 10)) / 10}B`;
    }
  }

  function setFirstLastArrowButtons() {
    const mainElement = document.querySelector('main');
    const firstLi = mainElement.querySelector('li:first-of-type .up-button');
    if (firstLi) {
      firstLi.setAttribute("disabled", "true");
    }
    const lastLi = mainElement.querySelector('li:last-of-type .down-button')
    if (lastLi) {
      lastLi.setAttribute("disabled", "true");
    }
  }

  /* public */

  function renderView(stocks, changeMode, layout, filterFields) {
    Controller = window.Stockr.controller;
    if (layout === 'home') {
      renderAppHeader();
      renderHomeAndFilterMain(stocks, changeMode, layout);
    }
    else if (layout === 'filter') {
      let filteredStocks = Controller.filterStocks();
      renderAppHeader();
      renderHomeAndFilterMain(filteredStocks, changeMode, layout);
      addFilterForm(filterFields);
    }
    else if (layout === 'search') {
      renderSearchHeader();
      renderSearchMain();
      addKeyUpEventListener();
    }
  }

  function addKeyUpEventListener() {
    document.querySelector('.search-header input')
      .addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
          console.log(`KeyUpEventHandler: input is: ${event.target.value}`);
          Controller.searchStocks(event.target.value);
        }
      });
  }

  function addStockClick(event){
    const symbol = event.target.getAttribute('data-symbol');
    console.log('addStockClick: add symbol'+symbol);
    Controller.addSymbolToList(symbol);
  }

  function addFilterForm(filterFields) {

    const mainElement = document.querySelector('main');
    mainElement.innerHTML = `
      <div class="filter-header">
        <hr>
        <div class="filter-header-content">
          <ul class="filter-params">
            <li class="filter-param short-filter-param">
              <label for="Name-filter">By Name</label>
              <input type="text" id="Name-filter" placeholder="${filterFields.byName}"/>
            </li>
            <li class="filter-param short-filter-param">
              <label for="gain-filter">By Gain</label>
              <select id="gain-filter" value="${filterFields.byGain}">
                <option value="gaining">Gaining</option>
                <option value="losing">Losing</option>
                <option value="all" selected>All</option>
              </select>
            </li>
            <li class="filter-param long-filter-param">
              <label for="range-from-filter">By Range: From</label>
              <input type="text" id="range-from-filter" placeholder="${filterFields.byRangeFrom}"/>
            </li>
            <li class="filter-param long-filter-param">
              <label for="range-to-filter">By Range: To</label>
              <input type="text" id="range-to-filter" placeholder="${filterFields.byRangeTo}"/>
            </li>
          </ul>
          <button class="apply-filter-button" data-type="apply-filter-button">Apply</button>
        </div>
      </div>
    `
      + mainElement.innerHTML;
  }

  function renderAppHeader() {
    const headerElement = document.querySelector('header');
    headerElement.innerHTML = `
    <span class="stokr-header">STOKR</span>
        <nav>
          <ul class="app-nav-buttons">
            <li>
              <a class="search-button" data-id="search-button" href="#search"><img src="assets/svg/search.svg" data-type="search-button"></a>
            </li>
            <li>
              <button class="refresh-button" data-id="refresh-button"><img src="assets/svg/refresh.svg"
                                                                           data-type="refresh-button"></button>
            </li>
            <li>
              <button class="filter-button" data-id="filter-button"><img src="assets/svg/filter.svg"
                                                                         data-type="filter-nav-button"></button>
            </li>
            <li>
              <button class="settings-button" data-id="settings-button"><img src="assets/svg/settings.svg"
                                                                             data-type="settings-button"></button>
            </li>
          </ul>
        </nav>`
  }

  function renderSearchMain(foundStocks) {
    const mainElement = document.querySelector('main');
    if (!foundStocks || foundStocks.length===0) {
      const textSearch = foundStocks? 'Not Found' : 'Search';
      mainElement.innerHTML = `
    <div class="empty-search">
      <span class="search-text">${textSearch}</span>
    </div>
    `
    }

    else {
      mainElement.innerHTML = `
    <div class="search">
      <ul class="found-stocks-list">
        ${createFoundStocksList(foundStocks)}
      </ul>
    </div>
    `;
    }
  }

  function createFoundStocksList(foundStocks) {
    return `${foundStocks.map(function (stock) {
      return createSearchLi(stock);
    }).join('')}`
  }

  function createSearchLi(stock) {
    let li =
      `<li>
          <h2 class="symbol-and-name">
            <span class="symbol">${stock.symbol}</span>
            <span class="stock-name">${stock.name}</span>
          </h2>
          <div class="stock-data">
            <button data-type="add-button" class="add-button" data-symbol="${stock.symbol}">+</button>
          </div>
       </li>`;

    return li;
  }

  function renderSearchHeader() {
    const headerElement = document.querySelector('header');
    headerElement.innerHTML = `
    <div class="search-header">
      <input type="text" class="search-input">
      <a class="cancel-search-button" href="#">Cancel</a> 
    </div>
    <hr>`;
  }

  function renderHomeAndFilterMain(stocks, changeMode, layout) {
    const mainElement = document.querySelector('main');
    console.log(`renderMain change mode ${changeMode}`);
    mainElement.innerHTML = `
      <ul class="stock-list">
        ${createList(stocks, changeMode)}
      </ul>`;
    setFirstLastArrowButtons();
    setArrowButtonsDisplay(layout);
  }

  function setArrowButtonsDisplay(layout) {
    if (layout === 'filter') {
      toggleDisplayBySelector('.up-down-buttons');
    }
  }

  function toggleDisplayBySelector(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.classList.toggle("display-none");
    });
  }


  function enableAllNavButtons() {
    const navButtons = document.querySelectorAll('.app-nav-buttons button');
    navButtons.forEach(function (button) {
      button.setAttribute("disabled", "false");
    })
  }

  function addEventListeners() {
    const appElement = document.querySelector('.app');
    appElement.addEventListener('click', function (event) {
      const targetDataType = event.target.dataset.type;
      if (clickEventHandlers[targetDataType]) {
        clickEventHandlers[targetDataType](event);
      }
    });
    window.addEventListener('hashchange', function () {
      hashChangedHandler();
    })
  }

  function hashChangedHandler() {
    console.log('hashChangedHandler');
    const hash = window.location.hash.slice(1);
    // if (hash === 'search'){
    Controller.hashChanged(hash);
    // }
  }

  function arrowButtonsClick(event) {

    const symbol = event.target.getAttribute('data-id');
    const upDown = event.target.classList.contains('up-button') ? 'up' : 'down';
    console.log(window.Stockr.controller);
    Controller.swapStocks(symbol, upDown);
  }

  function filterNavButtonClick() {

    console.log('filter-button pressed');

    toggleDisplayBySelector('.filter-header');

    // toggleDisplayBySelector('.up-down-buttons')

    turnButtonGreen('.filter-button');

    Controller.updateFilterLayout();

    // Controller.disableInactiveNavBarButtons();
  }

  function refreshButtonClick() {
    Controller.refreshButtonClick();
  }

  function changeButtonClick() {
    Controller.changeButtonClick();
  }

  function turnButtonGreen(selector) {
    const button = document.querySelector(selector);
    button.classList.toggle("green-button");
  }

  window.Stockr.view = {
    renderSearchMain :renderSearchMain,
    renderView: renderView,
    // toggleHideBySelector : toggleHideBySelector,
    toggleDisplayBySelector: toggleDisplayBySelector,
    enableAllNavButtons: enableAllNavButtons,
    addEventListeners: addEventListeners
  }

}());
