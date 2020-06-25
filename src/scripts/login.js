/* global Requests */

const form = document.getElementById('loginForm');

function handleLogin(event) {
  event.preventDefault();
  const submitBtn = event.submitter;
  const enabledCls = submitBtn.className;
  submitBtn.disabled = true;
  submitBtn.className += ' btn-disabled';
  (async () => {
    const username = form.elements.user.value;
    const password = form.elements.password.value;

    const formHint = document.getElementById('loginResult');

    try {
      const response = await Requests.post('/login', {
        username,
        password,
      });

      if (response.status === 200) {
        const user = await response.json();
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = './index.html';
      } else {
        const { errors } = await response.json();
        formHint.innerHTML = errors.message;
      }
    } catch (error) {
      formHint.innerHTML = 'Error while trying to process your request';
    }

    submitBtn.className = enabledCls;
    submitBtn.disabled = !true;
  })();
}

form.onsubmit = handleLogin;
