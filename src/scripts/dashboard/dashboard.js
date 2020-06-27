/* global Requests */
import HashRouter, { matches } from '../router';
import { Dashboard } from './boards';
import { createEditProfileForm } from './htmlCreators';

const container = document.getElementById('root');
const hashLinks = document.querySelectorAll('a[href^="#"]');

const dashboard = new Dashboard(container);
let currentUser = null;

async function loadUserBoards() {
  const response = await Requests.get('/boards');

  if (response.status === 200) {
    const userBoards = await response.json();

    dashboard.loadBoards(...userBoards);
  }
}

function renderPrivateRoutes({ action, route }) {
  const user = localStorage.getItem('user');
  if (!user) {
    window.location.href = './login.html';
    return;
  }
  currentUser = JSON.parse(user);
  const { token } = currentUser;
  Requests.headers.defaults.Authorization = `Token token="${token}"`;
  loadUserBoards();
  hashLinks.forEach((link) => {
    if (matches(link.hash.slice(1))) link.classList.add('boards-nav-link--active');
    else link.classList.remove('boards-nav-link--active');
  });
  action(route);
}

function renderBoards() {
  dashboard.onStateChange();
}

function renderClosedBoards() {
  dashboard.onStateChange();
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = './index.html';
}

function renderProfile() {
  const { id } = currentUser;

  container.innerHTML = createEditProfileForm(currentUser, false);
  const getForm = () => document.getElementById('updateUserForm');
  const form = getForm();
  form.querySelector('#deleteAccBtn').onclick = function deleteAccount() {
    Requests.delete(`/users/${id}`).then(logout);
  };

  form.onsubmit = function toggleEditMode() {
    container.innerHTML = createEditProfileForm(currentUser, true);
    const editForm = getForm();
    const cancelBtn = editForm.querySelector('#cancelEditBtn');
    cancelBtn.onclick = renderProfile;
    /* bind update action to the edit user form */
    editForm.onsubmit = async function updateUser(e) {
      e.preventDefault();
      form.querySelector('button').classList.toggle('btn-disabled');

      const rawResponse = await Requests.patch(`/users/${id}`, {
        user: {
          username: form.user.value,
          email: form.email.value,
          first_name: form.firstName.value,
          last_name: form.lastName.value,
        },
      });

      const contentBody = await rawResponse.json();
      if (rawResponse.status === 200) {
        localStorage.setItem('user', JSON.stringify(contentBody));
        window.location.href = './index.html';
      } else {
        // showErrors(form, contentBody);
        console.error('unknown error');
      }
    };
  };
}

const routes = {
  '/': renderBoards,
  '/closed': renderClosedBoards,
  '/profile': renderProfile,
  logout,
};
const { handleLinkRedirect } = HashRouter(renderPrivateRoutes, routes);

hashLinks.forEach((link) => link.addEventListener('click', handleLinkRedirect));
