const stripe = Stripe('pk_test_51Mgw9KIUA8Ig4zfgFpwxPuaIFaSUg6ddoIDceedj9CopVukhNhWSkN85El7liO4anN2n53n20QztCDrHHED5Htpk00J4WR4zmP');

const bookTour = async (tourId) => {
    try {
        // 1. Get checkout-session from backend API
        const session = await axios.get(`http://localhost:8000/api/v1/booking/checkout-session/${tourId}`);
    
        // 2. Use Stirpe object to create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    } catch (error) {
        console.log(error);
        alert('Something went wrong. Try booking again!');
    }
}

const bookBtn = document.getElementById('book-tour')
if (bookBtn) {
    bookBtn.addEventListener('click', (e) => {
        console.log('clicked!');
        e.target.textContent = 'Proccessing...'
        const tourId = e.target.dataset.tourId;

        bookTour(tourId);
    });
}
