require('dotenv').config();

const connectDB = require('./connectDB/connect');
const Product = require('./models/product');
const jsonProducts = require('./products.json');

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log('connected to DB');       
    } catch (error) {
        console.log(error);
    }
};

start();