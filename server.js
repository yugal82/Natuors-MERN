const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const mongoose = require('mongoose');

const CONNECTION_STRING = process.env.MONGO_DB_URL;
mongoose.set('strictQuery', false);

// mongodb connection
mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connection successful!'))
    .catch(err => console.log(err));

// listening to the server on specified port
app.listen(process.env.PORT, () => {
    console.log('server is live!');
});