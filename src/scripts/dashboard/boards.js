/* global Requests */

import Observable from '../observable';
import { matches } from '../router';
import {
  newBoardFormHTML, createBoardSection, createBoard, newBoardBtnHTML,
} from './htmlCreators';

const starSVG = require('../../assets/star.svg');
const bracketsSVG = require('../../assets/brackets.svg');

export function onBoardClick() {
  const boardId = parseInt(this.dataset.boardId, 10);
  localStorage.setItem('currentBoard', boardId);
  window.location.href = './board.html';
}

function changeNewBoardColor() {
  const form = document.getElementById('newBoardForm');
  const { color } = this.dataset;
  form.parentElement.className = `newBoardBtn--new board-${color}`;
  form.elements.color.value = color;
}

async function createNewBoard({ instance }, event) {
  event.preventDefault();
  const name = this.elements.board_name.value;
  const color = this.elements.color.value;
  const newBoard = {
    name,
    color,
    closed: false,
    starred: false,
  };
  const response = await Requests.post('/boards', newBoard);

  if (response.status === 201) {
    const { id } = await response.json();
    instance.addBoards({ ...newBoard, id });
  }
}

export function openBoardCreator({ wrappedFn, instance }) {
  const newBoardCls = 'newBoardBtn--new';
  const originalHTML = this.innerHTML;
  this.innerHTML = newBoardFormHTML;
  this.className = newBoardCls;

  this.removeEventListener('click', wrappedFn);

  const form = document.getElementById('newBoardForm');
  form.querySelector('.svg-cross').onclick = (e) => {
    e.stopPropagation();
    this.innerHTML = originalHTML;
    this.className = 'newBoardBtn';
    this.addEventListener('click', wrappedFn);
  };
  form.addEventListener('submit', instance.wrapFn(createNewBoard));

  const colorTogglers = this.querySelectorAll('.board-color-opt');
  colorTogglers.forEach((toggler) => {
    toggler.addEventListener('click', changeNewBoardColor);
  });
}

const getInitialState = () => ({
  boards: {
    all: [],
    open: {
      all: [],
      starred: [],
      normal: [],
    },
    closed: [],
  },
});

export class Dashboard extends Observable {
  constructor(container) {
    super();
    this.state = {
      ...getInitialState(),
    };
    this.loaded = false;
    this.container = container;
  }

  wrapFn(fn) {
    const instance = this;
    function wrappedFn(...args) {
      fn.call(this, { wrappedFn, instance }, ...args);
    }
    return wrappedFn;
  }

  addBoards(...boards) {
    const { all, open, closed } = this.state.boards;

    boards.forEach((board) => {
      all.push(board);
      if (board.closed) {
        closed.push(board);
      } else {
        open.all.push(board);
        if (board.starred) {
          open.starred.push(board);
        } else {
          open.normal.push(board);
        }
      }
    });

    this.setState({ ...this.state });
  }

  changeBoard(boardId, muteFn) {
    const allBoards = this.state.boards.all;
    const current = allBoards.find((target) => target.id === boardId);
    const update = muteFn(current);
    Object.assign(current, update);
    Requests.patch(`/boards/${boardId}`, update).then(() => {
      this.loadBoards(...allBoards);
    });
  }

  deleteBoard(boardId) {
    const allBoards = this.state.boards.all;
    const filtered = allBoards.filter((target) => target.id !== boardId);
    Requests.delete(`/boards/${boardId}`).then(() => {
      this.loadBoards(...filtered);
    });
  }

  loadBoards(...boards) {
    this.setState({ ...getInitialState() });
    this.loaded = true;
    this.addBoards(...boards);
  }

  renderMyBoards() {
    const {
      open: { starred, normal },
    } = this.state.boards;
    // add starred boards
    if (starred.length) {
      this.container.innerHTML += createBoardSection({
        icon: starSVG,
        title: 'Your Starred Boards',
        content: starred.map(createBoard).join(''),
      });
    }
    // add regular boards
    this.container.innerHTML += createBoardSection({
      icon: bracketsSVG,
      title: 'Your boards',
      content: `${normal.map(createBoard).join('')} ${newBoardBtnHTML}`,
    });

    // bind onClick to newBoardBtn
    const newBoardBtn = document.getElementById('newBoardBtn');
    newBoardBtn.addEventListener('click', this.wrapFn(openBoardCreator));
  }

  renderClosedBoards() {
    const { closed } = this.state.boards;
    this.container.innerHTML += createBoardSection({
      icon: starSVG,
      title: 'Closed Boards',
      content: closed.map(createBoard).join(''),
    });
  }

  onStateChange() {
    if (!this.loaded) return;

    if (matches('/')) {
      this.container.innerHTML = '';
      this.renderMyBoards();
    }
    if (matches('/closed')) {
      this.container.innerHTML = '';
      this.renderClosedBoards();
    }

    // attach on click listeners
    const visibleBoards = this.container.querySelectorAll('div[data-board-id]');
    visibleBoards.forEach((board) => {
      board.addEventListener('click', onBoardClick);
      const boardId = parseInt(board.dataset.boardId, 10);

      const starTogglers = board.querySelectorAll('.svg-star');
      starTogglers.forEach((toggler) => {
        toggler.addEventListener('click', (e) => {
          e.stopPropagation();
          this.changeBoard(boardId, (target) => ({ starred: !target.starred }));
        });
      });
      const boardClosers = board.querySelectorAll('.svg-close');
      boardClosers.forEach((toggler) => {
        toggler.addEventListener('click', (e) => {
          e.stopPropagation();
          this.changeBoard(boardId, () => ({ closed: true }));
        });
      });

      const boardOpeners = board.querySelectorAll('.svg-open');
      boardOpeners.forEach((toggler) => {
        toggler.addEventListener('click', (e) => {
          e.stopPropagation();
          this.changeBoard(boardId, () => ({ closed: false }));
        });
      });

      const boardDeleters = board.querySelectorAll('.svg-trash');
      boardDeleters.forEach((toggler) => {
        toggler.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteBoard(boardId);
        });
      });
      /*  */
    });
  }
}
