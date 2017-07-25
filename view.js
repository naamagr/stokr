(function () {

  'use strict';
  window.Stockr = window.Stockr || {};

  var Controller;

  /* private */

  const clickEventHandlers = {
    'change-button': changeButtonClick,
    'up-down-buttons': arrowButtonsClick,
    'filter-nav-button': filterNavButtonClick,
    'apply-filter-button' : applyFilterStocks
  };

  function applyFilterStocks(){
    let filterFields = {};
    filterFields.byName = document.querySelector('input[id="Name-filter"]').value;
    const gainFilterElement = document.querySelector('select[id="gain-filter"]');
    filterFields.byGain = gainFilterElement.options[gainFilterElement.selectedIndex].value;
    filterFields.byRangeFrom = document.querySelector('input[id="range-from-filter"]').value;
    filterFields.byRangeTo = document.querySelector('input[id="range-to-filter"]').value;
    Controller.filterStocks(filterFields);
  }

  function createList(stocks,changeMode){
    console.log(`createList stocks ${stocks}`);
    return `${stocks.map ( function(stock) {
      // let changeMode = window.Stockr.controller.getChangeMode(state.ui.currentChangeViewIndex);
      return createLi(stock, changeMode);
    }).join('')}`
  }

  function createLi(stockItem, changeMode) {
    const lastTradePrice = Math.trunc(stockItem.LastTradePriceOnly * 100) / 100;
    const stockChange = getChangeValue(stockItem, changeMode);
    const changeClass = stockItem.PercentChange[0] === '+' ? 'change-plus' : 'change-minus';

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
      return (Math.trunc(stockItem.Change * 10)) / 10;
    }
    else if (changeMode === 'percent') {
      return stockItem.PercentChange;
    }
    else {
      return `${stockItem.tempChange}B`;
    }
  }

  function setFirstLastArrowButtons() {
    const mainElement = document.querySelector('main');
    const firstLi = mainElement.querySelector('li:first-of-type .up-button');
    if (firstLi) {
      firstLi.setAttribute("disabled", "true");
    }
    const lastLi = mainElement.querySelector('li:last-of-type .down-button')
    if (lastLi){
      lastLi.setAttribute("disabled", "true");
    }
  }

  /* public */

  function renderMain(stocks,changeMode,layout) {
    Controller = window.Stockr.controller;
    const mainElement = document.querySelector('main');
    console.log(`renderMain change mode ${changeMode}`);
    mainElement.innerHTML = `
      <ul class="stock-list">
        ${createList(stocks,changeMode)}
      </ul>`;
    setFirstLastArrowButtons();
    setArrowButtonsDisplay(layout);
  }

  function setArrowButtonsDisplay(layout)
  {
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

  // function toggleHideBySelector(selector) {
  //   const elements = document.querySelectorAll(selector);
  //   elements.forEach((element) => {
  //     element.classList.toggle("hide");
  //   });
  // }

  function enableAllNavButtons(){
    const navButtons = document.querySelectorAll('.app-nav-buttons button');
    navButtons.forEach(function (button) {
      button.setAttribute("disabled", "false");
    })
  }

  function addEventListeners() {
    const appElement = document.querySelector('.app');
    appElement.addEventListener('click', function (event) {
      const targetDataType = event.target.dataset.type;
      console.log(targetDataType);
      if (clickEventHandlers[targetDataType]) {
        clickEventHandlers[targetDataType](event);
      }
    })
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

    Controller.disableInactiveNavBarButtons();
  }

  function changeButtonClick() {
    Controller.changeButtonClick();
  }

  function turnButtonGreen(selector){
    const button = document.querySelector(selector);
    button.classList.toggle("green-button");
  }

  window.Stockr.view = {
    renderMainElement: renderMain,
    // toggleHideBySelector : toggleHideBySelector,
    toggleDisplayBySelector : toggleDisplayBySelector,
    enableAllNavButtons : enableAllNavButtons,
    addEventListeners : addEventListeners
  }

}());
