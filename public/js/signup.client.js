let isEmailAvailable = true;
let isUsernameAvailable = true;

function validateUsernameFormat(username) {
  const usernamePattern = /^[a-zA-Z0-9_]+$/;
  return usernamePattern.test(username);
}

function validateEmailFormat(email) {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailPattern.test(email);
}

document.getElementById('email').addEventListener('input', function () {
  let email = this.value;
  const emailMessageElement = document.getElementById('email-message');
  if (email.length > 0 && validateEmailFormat(email)) {
    fetch('/signup/check_availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    .then(response => response.json())
    .then(data => {
      if (data.emailExists) {
        emailMessageElement.textContent = 'This email exists!';
        isEmailAvailable = false;
      } else {
        emailMessageElement.textContent = '';
        isEmailAvailable = true;
      }
    });
  } else {
    emailMessageElement.textContent = '';
    isEmailAvailable = false;
  }
});

document.getElementById('username').addEventListener('input', function () {
  let username = this.value;
  const usernameMessageElement = document.getElementById('username-message');
  if (!validateUsernameFormat(username)) {
    usernameMessageElement.textContent = 'Username can only contain letters, numbers, and underscores!';
    isUsernameAvailable = false;
    return;
  }
  if (username.length > 0) {
    fetch('/signup/check_availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
    .then(response => response.json())
    .then(data => {
      if (data.usernameExists) {
        usernameMessageElement.textContent = 'This username exists!';
        isUsernameAvailable = false;
      } else {
        usernameMessageElement.textContent = '';
        isUsernameAvailable = true;
      }
    });
  } else {
    usernameMessageElement.textContent = '';
    isUsernameAvailable = false;
  }
});

document.getElementById('toggle-password').addEventListener('click', function () {
  const passwordField = document.getElementById('password');
  const toggleIcon = this.querySelector('i');

  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    toggleIcon.classList.remove('fa-eye');
    toggleIcon.classList.add('fa-eye-slash');
  } else {
    passwordField.type = 'password';
    toggleIcon.classList.remove('fa-eye-slash');
    toggleIcon.classList.add('fa-eye');
  }
});

document.getElementById('signupForm').addEventListener('submit', function (event) {
  event.preventDefault();

  let first_name = document.getElementById('first_name').value.trim();
  let last_name = document.getElementById('last_name').value.trim();
  let email = document.getElementById('email').value.trim();
  let username = document.getElementById('username').value.trim();
  let password = document.getElementById('password').value;
  let termsChecked = document.getElementById('terms').checked;

  let valid = true;

  if (first_name.length === 0 || first_name.length > 30) valid = false;
  if (last_name.length === 0 || last_name.length > 30) valid = false;
  if (!validateEmailFormat(email)) valid = false;
  if (!validateUsernameFormat(username)) valid = false;
  if (password.length < 6 || password.length > 255) valid = false;
  if (!termsChecked) valid = false;
  if (!isEmailAvailable || !isUsernameAvailable) valid = false;

  if (!valid) {
    Swal.fire({
      icon: 'error',
      title: 'Check your inputs',
      text: 'Please correct the errors in the form before submitting.'
    });
    return;
  }

  fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name, last_name, email, username, password, terms: termsChecked
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Registration successful',
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        window.location.href = 'login.html';
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Registration Error',
        html: data.errors ? data.errors.join('<br>') : 'Registration failed. Please try again.'
      });
    }
  })
  .catch(() => {
    Swal.fire({
      icon: 'error',
      title: 'Network Error',
      text: 'Please try again later.'
    });
  });
});
