
// to login the user
const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:8000/login',
            data: {
                email,
                password
            }
        });

        if (res.data.status == 'Success') {
            alert('logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }

    } catch (error) {
        alert(error.response.data.message);
    }
}

const form = document.querySelector('.form--login');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
    });
}

// to logout the user
const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:8000/logout'
        });
        console.log(res);
        if (res.data.status == 'Success') {
            location.reload(true);
        }
    } catch (error) {
        alert('Error logging out, try again.')
    }
}

const logoutBtn = document.querySelector('.nav__el--logout');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}


// to update the user's data
const updateUserData = async (name, email) => {
    try {
        const body = {
            name,
            email
        }
        const res = await axios.patch('http://localhost:8000/api/v1/users/update', body);

        if (res.data.status == 'Success') {
            alert('Data updated successfully!');
        }
    } catch (error) {
        alert('Error while updating your data. Try again!', error.message);
    }
}

const updateUserForm = document.querySelector('.form-user-data');
if (updateUserForm) {
    updateUserForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        updateUserData(name, email);
    });
}

// to update the user's password
const updatePassword = async (passwordCurrent, password, confirmPassword) => {
    try {
        const body = {
            passwordCurrent,
            password,
            confirmPassword
        }
        const res = await axios.patch('http://localhost:8000/update-password', body);
        if (res.data.status == 'Success') {
            alert('Password updated successfully!');
        }
    } catch (error) {
        alert(error.response.data.message);
    }
}

const updatePasswordForm = document.querySelector('.form-user-password');
if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;

        await updatePassword(passwordCurrent, password, confirmPassword);

        document.getElementById('password-current').value = ''
        document.getElementById('password').value = ''
        document.getElementById('password-confirm').value = ''
    })
}