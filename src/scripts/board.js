/* global Requests, ColorsBgMap */

const closeIconPath = require('../assets/close.svg');
const checkIconPath = require('../assets/check.svg');
const plusIconPath = require('../assets/plus.svg');
const crossIconPath = require('../assets/cross.svg');
const editIconPath = require('../assets/edit.svg');

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function returnIndex() {
  window.location.href = './index.html';
}

function renderBoardLabels(labels) {
  const container = document.querySelector('.modal__labels');

  labels.forEach((label) => {
    const labelContainer = document.createElement('div');
    labelContainer.classList.value = 'flex flex-row w-1/2 mt-2';

    const editButton = document.createElement('button');
    editButton.innerHTML = `<img src="${editIconPath}" alt="edit label" class="p-2">`;

    const labelElement = document.createElement('div');
    labelElement.classList.add(
      `${ColorsBgMap[label.color]}`,
      'text-white',
      'py-1',
      'px-3',
      'flex',
      'items-center',
      'justify-center',
      'flex-grow',
      'rounded',
      'h-10',
    );
    labelElement.textContent = label.name;

    labelContainer.append(labelElement);
    labelContainer.append(editButton);
    container.append(labelContainer);
  });
}

function renderCardLabels(labels) {
  const container = document.querySelector('.card-labels');
  labels.forEach((label) => {
    const labelElement = document.createElement('div');
    labelElement.classList.add(
      `${ColorsBgMap[label.color]}`,
      'text-white',
      'py-1',
      'px-3',
      'mr-2',
      'flex',
      'items-center',
      'justify-center',
      'rounded',
      'h-8',
    );
    labelElement.textContent = label.name;
    container.append(labelElement);
  });
}

function renderDescription(desc) {
  const container = document.querySelector('.card__desc');
  container.textContent = desc || 'No description provided';
}

function renderCardName(name) {
  const cardName = document.querySelector('.card-name');
  cardName.textContent = name || 'Change the name';
}

function createCheckList(checklist) {
  const baseHTML = `<header class="flex flex-row justify-between">
                    <p class="font-bold my-1">${checklist.name}</p>
                    <button class="bg-gray-200 py-1 px-5 rounded">
                      Delete
                    </button>
                    </header>
                    <form>
                    </form>
                    <button class="bg-gray-200 py-1 px-5 mx-8 my-3 rounded">
                    Add Item
                    </button>`;

  const checklistElement = document.createElement('div');
  checklistElement.classList.add('checklist');
  checklistElement.innerHTML = baseHTML;

  const form = checklistElement.querySelector('form');

  checklist.checkItems.forEach((item) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', `${item.checkItemId}`);
    input.checked = item.completed;

    const label = document.createElement('label');
    label.setAttribute('for', `${item.checkItemId}`);
    label.textContent = item.name;

    const group = document.createElement('div');
    group.classList.add('check-group');

    group.append(input);
    group.append(label);

    form.append(group);
  });

  return checklistElement;
}

async function renderCheckLists(listId, cardId) {
  const rawResponse = await Requests.get(`/lists/${listId}/cards/${cardId}`);
  const response = await rawResponse.json();
  const container = document.querySelector('.card-checklists');
  response.checklists.forEach((checklist) => {
    container.append(createCheckList(checklist));
  });
}

function createListElement(list) {
  const cards = list.cards
    .map((card) => {
      const labels = card.labels
        .map((label) => {
          const labelsHTML = document.createElement('div');
          labelsHTML.classList.value = 'card__label rounded';
          labelsHTML.classList.add(ColorsBgMap[label.color]);
          return labelsHTML.outerHTML;
        })
        .join('');

      const labelsHTML = labels === ''
        ? ''
        : `<div class="card__labels mb-1 flex flex-row">${labels}</div>`;

      const checksHTML = card.checkItems
        ? ` <div>
                <p class="list__icon-wrapper text-sm text-gray-700">
                <img width="16" height="16" class="text-gray-700 mx-2 filter-gray" src="${checkIconPath}"/>
                  ${card.checkItems}/${card.completedCheckItems}
                </p>
             </div>`.trim()
        : '';

      const cardHTML = `
             <li class="bg-white shadow rounded py-1 px-2 mt-2 flex flex-col">
              ${labelsHTML}
              <p>Add ${card.name}</p>
              ${checksHTML}
            </li>`;

      return cardHTML;
    })
    .join('');

  const listHTML = `
        <div class="w-1/4 max-w-sm bg-gray-200 shadow rounded mr-6">
          <header class="flex flex-row justify-between px-3 pt-3">
            <h2 class="text-xl font-bold">${list.name}</h2>
            <button class="list__icon-wrapper">
              <img width="16" height="16" src="${closeIconPath}" class="filter-gray-darker mx-2" />
            </button>
          </header>
          <ul class="px-2 pb-2">
            ${cards}
          </ul>

          <div class="p-2">
            <p>
              <a class="list__icon-wrapper">
                <img width="16" height="16" src="${plusIconPath}" class="filter-gray-darker text-gray-700 mx-2" />
                Add another card
              </a>
            </p>
          </div>
          <form action="#" class="form-add-card p-2 hidden">
            <input
              class="w-full rounded-sm px-1 py-1 box-border mb-2 border-blue-400 border"
              type="text"
              placeholder="Enter a title for this card..."
            />
            <button
              class="my-2 bg-green-500 px-3 py-1 rounded text-white"
              type="submit"
            >
              Add Card
            </button>
            <button class="list__icon-wrapper">
              <img width="16" height="16" src="${crossIconPath}" class="text-gray-800 mx-2" />
            </button>
          </form>
          </div>`;

  const template = document.createElement('template');
  template.innerHTML = listHTML;

  return template.content;
}

const user = JSON.parse(localStorage.getItem('user'));
if (isObjectEmpty(user)) {
  returnIndex();
}

const currentBoard = localStorage.getItem('currentBoard');
if (!currentBoard) {
  returnIndex();
}

const fetchBoard = async () => {
  /* Update for future Requests  */
  Requests.headers.defaults.Authorization = `Token token="${user.token}"`;

  const boardResponse = await Requests.get(`/boards/${currentBoard}`);
  if (boardResponse.status !== 200) {
    returnIndex();
  }
  const board = await boardResponse.json();
  if (board.userId !== user.id) {
    returnIndex();
  }

  /* Show lists */

  /* If it's starred, color it yellow */
  document.querySelector('main').classList.add(ColorsBgMap[board.color]);
  if (board.starred) {
    document.querySelector('#starred').classList.add('filter-yellow');
  }

  /* Append every list */
  const boardListsHTML = document.querySelector('.board__lists');

  board.lists.forEach((list) => {
    const listElement = createListElement(list);
    boardListsHTML.append(listElement);
  });

  /* Hide loader */
  setTimeout(() => {
    document.querySelector('#loader').classList.toggle('hidden');
  }, 500);

  /* Update modal labels */
  renderBoardLabels(board.labels);
  renderCardName(board.lists[1].cards[0].name);
  renderCardLabels(board.lists[1].cards[0].labels);
  renderDescription(board.lists[1].cards[0].desc);
  renderCheckLists(board.lists[1].listId, board.lists[1].cards[0].cardId);
};

fetchBoard().then();
