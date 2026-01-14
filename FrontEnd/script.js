document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const messageBox = document.getElementById('message');

  if (!username || !password) {
    messageBox.textContent = 'Please fill in all fields.';
    messageBox.style.color = 'red';
    return;
  }

  const loggerLogic = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      if (!res.ok) {
        messageBox.textContent = 'Invalid credentials';
        messageBox.style.color = 'red';
        return;
      }

      const data = await res.json();
      const token = data.access_token;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role; 
      console.log(payload, role)
      localStorage.setItem('token', token);
      messageBox.style.color = 'green';
      messageBox.textContent = `Logging in as ${role}...`;

      setTimeout(() => {
        switch (role) {
          case 'STUDENT':
            window.location.href = 'student/html/dashboard.html';
            break;
          case 'FACULTY':
            window.location.href = 'faculty/html/dashboard.html';
            break;
          case 'HOD':
            window.location.href = 'hod/html/dashboard.html';
            break;
          case 'ADMIN':
            window.location.href = 'admin/html/dashboard.html';
            break;
          default:
            messageBox.style.color = 'red';
            messageBox.textContent = 'Unauthorized role';
        }
      }, 500);

    } catch (err) {
      console.error(err);
      messageBox.textContent = 'Something went wrong';
      messageBox.style.color = 'red';
    }
  };

  loggerLogic();
});
