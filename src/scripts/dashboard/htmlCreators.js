const closeSVG = require('../../assets/close.svg');
const starSVG = require('../../assets/star.svg');
const trashSVG = require('../../assets/trash.svg');
const openSVG = require('../../assets/open.svg');

function createSVG(name, src, className = '') {
  return `<svg class="svg-${name} inline-block mt-auto w-4 h-4 ${className}">
    <use href="${src}#${name}"></use>
</svg>`;
}

export function createBoardSection({ icon, title, content }) {
  return `
  <section class="mb-8">
    <h2 class="ml-8 text-xl mb-4 font-bold">
        <img class="inline-block mb-1 mr-1" src="${icon}">${title}
    </h2>
    <div class="grid grid-cols-3 gap-4">           
    ${content}
    </div>
  </section>`;
}

export function createBoard({
  id, name, closed, starred, color,
}) {
  const star = createSVG('star', starSVG, starred ? 'text-yellow-500' : '');
  const close = createSVG('close', closeSVG);
  const trash = createSVG('trash', trashSVG);
  const open = createSVG('open', openSVG);

  let controls = `${close}${star}`;
  if (closed) {
    controls = `  ${trash}${open}`;
  }
  return `
  <div data-board-id=${id} class="board board-${color} ${
  starred ? 'board--starred' : ''
}">
  <h3 class="text-white font-medium pb-8">${name}</h3>
  <div class="board-controls">
  ${controls}
  </div>
  </div>
  `;
}

const colors = [
  'blue',
  'orange',
  'green',
  'red',
  'purple',
  'pink',
  'lime',
  'sky',
  'grey',
];
const createPickerOpt = (color) => `<div class="board-color-opt board-${color}" data-color="${color}"></div>`;

export const newBoardFormHTML = `
<form id="newBoardForm">
<div class="flex">
  <input 
    class="w-5/6 px-1 placeholder-white text-white font-medium flex-shrink rounded bg-white bg-opacity-50"
    type="text"
    name="board_name"
    placeholder="Board name"
  >
  <input type="text" name="color" value="blue" hidden>
  <img class="ml-auto w-5 h-5" src="${starSVG}">
</div>
<div class="board-color-picker">
${colors.map(createPickerOpt).join('')}
</div>
<button class="newBoardSubmit" type="submit">Create Board</button>
</form>
`;

export function createEditProfileForm({
  username, email, firstName, lastName,
}, editMode = false) {
  const disabled = editMode ? '' : 'disabled';
  return `
  <form id="updateUserForm" class="max-w-sm mx-auto bg-gray-100 mt-20 py-8 px-4 shadow flex flex-col items-center"
  action="#">
  <div id="errors-wrapper" class="w-full bg-red-400 text-white text-center rounded m-3 p-2 hidden">
      <ul id="errors-list"></ul>
  </div>
  <div>
      <label class="block mb-1 font-bold" for="username">Username</label>
      <input id="username" name="user" value="${username}" class="px-1 box-border mb-2 border-blue-400 border rounded-sm" ${disabled}
          type="text" required />
  </div>
  <div>
      <label class="block mb-1 font-bold" for="email">Email</label>
      <input id="email" name="email" value="${email}" class="rounded-sm px-1 box-border border-blue-400 border" ${disabled}
          type="email" />
  </div>
  <div>
      <label class="block mb-1 font-bold" for="firstName">First Name</label>
      <input id="firstName" name="firstName" value="${firstName}" class="rounded-sm px-1 box-border border-blue-400 border" ${disabled}
          type="text" required />
  </div>
  <div>
      <label class="block mb-1 font-bold" for="lastName">Last Name</label>
      <input id="lastName" name="lastName" value="${lastName}" class="rounded-sm px-1 box-border border-blue-400 border" ${disabled}
          type="text" required />
  </div>
  <div class="flex justify-between">
      <button class="my-4 mr-8 ${editMode ? 'bg-green-500' : 'bg-gray-300 text-gray-800'} px-3 py-1 rounded text-white" type="submit">
       ${editMode ? 'Save' : 'Edit'}
      </button>
      <button id="${editMode ? 'cancelEditBtn' : 'deleteAccBtn'}" class="my-4 bg-red-500 px-3 py-1 rounded text-white" type="button">
          ${editMode ? 'Cancel' : 'Delete'}
      </button>
  </div>
</form>`;
}
