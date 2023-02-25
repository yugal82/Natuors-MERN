
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

const form = document.querySelector('.form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
    });
}

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
