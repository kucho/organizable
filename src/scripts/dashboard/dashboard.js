/* global Requests */
import HashRouter, { matches } from '../router';
import { createBoardSection, createBoard } from './boards';

const starSVG = require('../../assets/star.svg');
const bracketsSVG = require('../../assets/brackets.svg');

const boards = {
  open: [],
  closed: [],
};

function renderPrivateRoutes({ action, route }) {
  const user = localStorage.getItem('user');
  if (!user) {
    window.location.href = './login.html';
  }
  const { token } = JSON.parse(user);
  Requests.headers.default.Authorization = `Token token="${token}"`;
  action(route);
}

const container = document.getElementById('root');

async function renderBoards(route) {
  const response = await Requests.get('/boards');

  if (response.status === 200) {
    const userBoards = await response.json();

    boards.closed = [];
    boards.open = [];
    userBoards.forEach((board) => {
      if (board.closed) {
        boards.closed.push(board);
      } else {
        boards.open.push(board);
      }
    });

    // if we're still on the route
    if (matches(route)) {
      const newBoardBtn = '<div class="bg-gray-200 rounded cursor-pointer text-center py-8">Create a new board</div>';

      const openBoards = {
        starred: [],
        normal: [],
      };

      boards.open.forEach((board) => {
        if (board.starred) {
          openBoards.starred.push(board);
        } else {
          openBoards.normal.push(board);
        }
      });

      // add starred boards
      if (openBoards.starred.length) {
        container.innerHTML += createBoardSection({
          icon: starSVG,
          title: 'Your Starred Boards',
          content: openBoards.starred.map(createBoard).join(''),
        });
      }
      // add regular boards
      container.innerHTML += createBoardSection({
        icon: bracketsSVG,
        title: 'Your boards',
        content: `${openBoards.normal.map(createBoard).join('')} ${newBoardBtn}`,
      });
    }
  }
}

function renderClosedBoards() {
  container.innerHTML = '';
  console.log('Closed boards');
}
function renderProfile() {
  container.innerHTML = '';
  console.log('Profile');
}
function logout() {
  console.log('Signing out');
}

const routes = {
  '/': renderBoards,
  '/closed': renderClosedBoards,
  '/profile': renderProfile,
  logout,
};
const { handleLinkRedirect } = HashRouter(renderPrivateRoutes, routes);

const hashLinks = document.querySelectorAll('a[href^="#"]');
hashLinks.forEach((link) => link.addEventListener('click', handleLinkRedirect));

// deepLink(router);
