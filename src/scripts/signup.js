/* global Requests */

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function showErrors(form, errors) {
  const errorList = form.querySelector('#errors-list');

  for (const [field, msg] of Object.entries(errors)) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${capitalize(field)}: </strong>${capitalize(msg.join(', '))}`;
    errorList.append(li);
  }
  form.querySelector('#errors-wrapper').classList.toggle('hidden');
}

document.querySelector('#signupForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = document.forms[0];
  form.querySelector('button').classList.toggle('btn-disabled');
  const username = form.user.value;
  const password = form.password.value;
  const email = form.email.value;
  const firstName = form.firstName.value;
  const lastName = form.firstName.value;

  const rawResponse = await Requests.post('/users', {
    user: {
      username, email, first_name: firstName, last_name: lastName, password,
    },
  });

  const contentBody = await rawResponse.json();
  if (rawResponse.status !== 201) {
    showErrors(form, contentBody);
  } else {
    localStorage.setItem('user', JSON.stringify(contentBody));
    window.location.href = './index.html';
  }
});
