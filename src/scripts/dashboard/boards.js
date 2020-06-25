const starSVG = require('../../assets/star.svg');

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
  const star = `<svg class="block mt-auto w-4 h-4 self-end text-yellow-500">
      <use href="${starSVG}#star"></use>
  </svg>
`;
  return `
  <div data-board-id=${id} class="flex flex-col cursor-pointer bg-blue-500 rounded px-2 py-2 justify-between">
    <h3 class="text-white font-medium ${starred ? 'pb-8' : 'pb-12'}">${name}</h3>
    ${starred ? star : ''}        
  </div>
  `;
}
