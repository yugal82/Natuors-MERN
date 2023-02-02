const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const Tours = require('../../models/toursModel');
const fs = require('fs');

const CONNECTION_STRING = process.env.MONGO_DB_URL;
mongoose.set('strictQuery', false);

// mongodb connection
mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connection successful!'))
    .catch(err => console.log(err));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

const importData = async () => {
    try {
        await Tours.create(tours);
        console.log('imported successfully!');
    } catch (error) {
        console.log(error);
    }
    process.exit()
}

const deleteData = async () => {
    try {
        await Tours.deleteMany();
        console.log('Deleted successfully!');
    } catch (error) {
        console.log(error);
    }
    process.exit()
}

if(process.argv[2] === '--delete'){
    deleteData();
}else if(process.argv[2] === '--import'){
    importData();
}