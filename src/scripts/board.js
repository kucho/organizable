/* global Requests, ColorsBgMap */

const closeIconPath = require('../assets/close.svg');
const checkIconPath = require('../assets/check.svg');
const plusIconPath = require('../assets/plus.svg');
const crossIconPath = require('../assets/cross.svg');
const editIconPath = require('../assets/edit.svg');

const BLANK_DESC = 'No description provided';
const BLANK_TITLE = 'Change the name!';

let Board = {};

function stringToHTML(str) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(str, 'text/html');
  return doc.body.firstChild;
}

function isObjectEmpty(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function toggleModal() {
  document.querySelector('.card-overlay').classList.toggle('hidden');
}

function toggleAddList() {
  document.querySelector('.link-add-list').classList.toggle('hidden');
  const form = document.querySelector('.form-add-list');
  form.parentNode.classList.toggle('bg-opacity-100');
  form.classList.toggle('hidden');
  if (!form.classList.contains('hidden')) {
    form.parentNode.classList.add('bg-opacity-100');
    const input = form.querySelector('input');
    input.value = '';
    input.focus();
  }
}

function toggleDescEdit() {
  const modal = document.querySelector('.card-modal');
  const descBtnEdit = modal.querySelector('.btn-edit-desc');
  const form = modal.querySelector('.form-edit-desc');
  const currentDesc = modal.querySelector('.card__desc');
  descBtnEdit.classList.toggle('hidden');
  currentDesc.classList.toggle('hidden');
  form.classList.toggle('hidden');

  if (!form.classList.contains('hidden')) {
    const input = form.querySelector('input');
    input.value = currentDesc.textContent === BLANK_DESC ? '' : currentDesc.textContent;
    input.focus();
    input.select();
  }
}

function resetModal() {
  const modal = document.querySelector('.card-modal');
  modal.querySelector('.card-labels').innerHTML = '';
  modal.querySelector('.card-checklists').innerHTML = '';
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
  container.textContent = desc || BLANK_DESC;
}

function renderCardName(name) {
  const cardName = document.querySelector('.card-name');
  cardName.textContent = name || BLANK_TITLE;
}

function createCheckListElement(checklist) {
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
    container.append(createCheckListElement(checklist));
  });
}

function showModal(listId, cardId) {
  const listIndex = Board.lists.findIndex(
    (list) => list.listId === parseInt(listId, 10),
  );
  const cardIndex = Board.lists[listIndex].cards.findIndex(
    (card) => card.cardId === parseInt(cardId, 10),
  );
  renderCardName(Board.lists[listIndex].cards[cardIndex].name);
  renderCardLabels(Board.lists[listIndex].cards[cardIndex].labels);
  renderDescription(Board.lists[listIndex].cards[cardIndex].desc);
  renderCheckLists(listId, cardId).then(() => {
    document.querySelector('.card-overlay').classList.toggle('hidden');
  });
  const modal = document.querySelector('.card-modal');
  modal.dataset.list = listId;
  modal.dataset.card = cardId;
}

async function addCardToList(text, listId) {
  const newCardRaw = await Requests.post(`/lists/${listId}/cards`, {
    name: text,
    desc: '',
    pos: null,
    closed: false,
  });

  const newCardResponse = await newCardRaw.json();

  /* Update board object */
  const listIndex = Board.lists.findIndex(
    (list) => list.listId === parseInt(listId, 10),
  );
  Board.lists[listIndex].cards.push({
    cardId: newCardResponse.id,
    name: newCardResponse.name,
    checkItems: 0,
    closed: false,
    completedCheckItems: 0,
    desc: '',
    labels: [],
    pos: null,
  });

  /* Insert new card in DOM */
  const newCardHTML = `<li class="bg-white shadow rounded py-1 px-2 mt-2 flex flex-col cursor-pointer" data-list="${listId}" data-card="${newCardResponse.id}">
        <p>${newCardResponse.name}</p>
       </li>`;

  const newCardElement = stringToHTML(newCardHTML);
  newCardElement.addEventListener('click', () => {
    showModal(
      newCardElement.dataset.list,
      newCardElement.dataset.card,
    );
  });
  document.querySelector(`.list-${listId}-cards`).append(newCardElement);
}

async function updateListName(listId, name, pos) {
  const rawResponse = await Requests.patch(`/boards/${Board.id}/lists/${listId}`, {
    name,
    pos,
  });
  if (rawResponse.status !== 200) {
    console.log(rawResponse);
  }
}

async function updateCard(listId, cardId, data) {
  const rawResponse = await Requests.patch(`/lists/${listId}/cards/${cardId}`, data);
  if (rawResponse.status !== 200) {
    console.log(rawResponse);
  }
}

async function deleteList(listId) {
  const rawResponse = await Requests.delete(`/boards/${Board.id}/lists/${listId}`);
  if (rawResponse.status !== 204) {
    console.log(rawResponse);
  }
}

async function deleteBoard() {
  const rawResponse = await Requests.delete(`/boards/${Board.id}`);
  if (rawResponse.status !== 204) {
    console.log(rawResponse);
  }
}

function listElement(listName, listId, cardsHTML) {
  const HTML = `
           <div class="list-${listId} w-1/4 max-w-sm bg-gray-200 shadow rounded mr-6 mb-6">
          <header class="flex flex-row justify-between px-3 pt-3">
            <h2 class="list-name text-xl font-bold flex-grow">${listName}</h2>
            <input type="text" name="title" class="flex-grow form-list-name rounded px-1 py-1 box-border border-blue-400 border hidden" data-list="${listId}">
            <button class="list__icon-wrapper delete-list">
              <img width="16" height="16" src="${closeIconPath}" class="filter-gray-darker mx-2" />
            </button>
          </header>
          <ul class="list-${listId}-cards px-2 pb-2">
            ${cardsHTML}
          </ul>
          <a class="p-2 w-full block link-add-card cursor-pointer text-gray-700">
              <img width="16" height="16" src="${plusIconPath}" class="inline-block filter-gray-darker text-gray-700 mx-2 pointer-events-none" />
                Add another card
          </a>
          <form action="#" class="form-add-card p-2 hidden" data-list="${listId}">
            <input
              class="w-full rounded-sm px-1 py-1 box-border mb-2 border-blue-400 border input-add-card"
              type="text"
              placeholder="Enter a title for this card..."
            />
            <button
              class="my-2 bg-green-500 px-3 py-1 rounded text-white  btn-add-card"
              data-list="${listId}"
            >
              Add Card
            </button>
            <button class="list__icon-wrapper close-add-card">
              <img width="16" height="16" src="${crossIconPath}" class="text-gray-800 mx-2 pointer-events-none" />
            </button>
          </form>
          </div>`;

  /* Give each list it's event listeners */
  const result = stringToHTML(HTML);

  /* Change the title */
  const formName = result.querySelector('.form-list-name');
  const currentName = result.querySelector('.list-name');

  formName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      updateListName(formName.dataset.list, formName.value, null).then(() => {
        currentName.textContent = formName.value;
      });
      e.target.classList.toggle('hidden');
      currentName.classList.toggle('hidden');
    }
    if (e.key === 'Escape') {
      e.target.classList.toggle('hidden');
      currentName.classList.toggle('hidden');
    }
  });

  currentName.addEventListener('click', (e) => {
    formName.value = e.target.textContent;
    e.target.classList.toggle('hidden');
    formName.classList.toggle('hidden');
    formName.focus();
    formName.select();
  });

  result.querySelector('.link-add-card').addEventListener('click', (e) => {
    e.target.classList.toggle('hidden');
    const form = e.target.parentNode.querySelector('.form-add-card');
    form.classList.toggle('hidden');
    form.querySelector('input').focus();
  });

  result.querySelector('.btn-add-card').addEventListener('click', async (e) => {
    e.preventDefault();
    const input = e.target.parentNode.querySelector('.input-add-card');
    const text = input.value;

    if (!text) {
      return false;
    }

    addCardToList(text, listId).then();

    /* Clear input */
    input.value = '';

    return false;
  });

  /* Add event listener to close-another-card buttons */
  result.querySelector('.close-add-card').addEventListener('click', () => {
    const list = document.querySelector(`.list-${listId}`);
    list.querySelector('.form-add-card').classList.toggle('hidden');
    list.querySelector('.link-add-card').classList.toggle('hidden');
  });

  // Delete the list
  result.querySelector('.delete-list').addEventListener('click', () => {
    if (window.confirm('Do you really want to delete this list?')) {
      deleteList(listId).then(() => {
        const el = document.querySelector(`.list-${listId}`);
        el.parentNode.removeChild(el);
      });
    }
  });

  return result;
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
             <li class="bg-white shadow rounded py-1 px-2 mt-2 flex flex-col cursor-pointer" data-list="${list.listId}" data-card="${card.cardId}">
              ${labelsHTML}
              <p>${card.name}</p>
              ${checksHTML}
             </li>`;

      return cardHTML;
    })
    .join('');

  return listElement(list.name, list.listId, cards);
}

async function addListToBoard(listName, pos) {
  const rawResponse = await Requests.post(`/boards/${Board.id}/lists`, {
    name: listName,
    pos,
    closed: false,
  });
  const response = await rawResponse.json();

  /* Insert to object */
  Board.lists.push({
    cards: [],
    listId: response.id,
    closed: false,
    name: listName,
    pos,
  });

  document.querySelector('.board__lists').append(listElement(listName, response.id, ''));
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

  Board = await boardResponse.json();
  if (Board.userId !== user.id) {
    returnIndex();
  }

  /* Show lists */
  document.querySelector('.board__title').textContent = Board.name;

  /* If it's starred, color it yellow */
  document.querySelector('main').classList.add(ColorsBgMap[Board.color]);
  if (Board.starred) {
    document.querySelector('.star-icon').classList.add('filter-yellow');
  }

  /* Append every list */
  const boardLists = document.querySelector('.board__lists');

  console.log(Board);

  Board.lists.forEach((list) => {
    const el = createListElement(list);
    boardLists.append(el);
  });

  /* Add event listeners to each card in the list */
  const lists = document.querySelectorAll('li');
  lists.forEach((el) => {
    el.addEventListener('click', () => {
      showModal(el.dataset.list, el.dataset.card);
    });
  });

  /* Hide loader */
  setTimeout(() => {
    document.querySelector('#loader').classList.toggle('hidden');
  }, 500);

  /* Update modal labels */
  renderBoardLabels(Board.labels);
};

window.onload = () => {
  document.querySelector('.close-modal').addEventListener('click', () => {
    resetModal();
    toggleModal();
  });

  document.querySelector('.link-add-list').addEventListener('click', () => {
    toggleAddList();
  });

  document.querySelector('.close-add-list').addEventListener('click', () => {
    toggleAddList();
  });

  document.querySelector('.btn-add-list').addEventListener('click', (e) => {
    e.preventDefault();
    const input = e.target.parentNode.querySelector('.input-add-list');
    const text = input.value;

    if (!text) {
      return false;
    }

    addListToBoard(text, null).then();

    /* Clear input */
    input.value = '';
    return false;
  });

  document.querySelector('.board-star').addEventListener('click', () => {
    Requests.patch(`/boards/${Board.id}`, {
      starred: !Board.starred,
    }).then(() => {
      document.querySelector('.star-icon').classList.toggle('filter-yellow');
    });
  });

  document.querySelector('.board-delete').addEventListener('click', () => {
    if (window.confirm('Do you really want to delete this board?')) {
      deleteBoard().then(() => {
        returnIndex();
      });
    }
  });

  const overlay = document.querySelector('.card-overlay');
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      resetModal();
      toggleModal();
    }
  });

  const modal = document.querySelector('.card-modal');
  const desc = modal.querySelector('.card__desc');
  const descBtnEdit = modal.querySelector('.btn-edit-desc');
  const descCloseEdit = modal.querySelector('.close-edit-desc');
  const descSaveEdit = modal.querySelector('.btn-save-edit');
  descBtnEdit.addEventListener('click', () => {
    toggleDescEdit();
  });

  descCloseEdit.addEventListener('click', () => {
    toggleDescEdit();
  });

  descSaveEdit.addEventListener('click', (e) => {
    e.preventDefault();
    const input = modal.querySelector('.input-edit-desc');
    const text = input.value;
    updateCard(modal.dataset.list, modal.dataset.card, { desc: text }).then(() => {
      desc.textContent = input.value;
      toggleDescEdit();
    });
  });
};

fetchBoard().then();
