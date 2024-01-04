require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();
const connectDB = require('./connectDB/connect');
const productsRouter = require('./routes/products');

const notFoundMiddleware = require('./middleware/not-found');
const errorMiddleware = require('./middleware/error-handler');

// Routes
app.get('/', (req, res) => {
    res.send('<h1>Welcome to our main page</h1><a href="/api/v1/products">Products</a>');
});

app.use('/api/v1/products', productsRouter);

// Errors route
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
    try {
        // connect to DB
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => console.log(`Server listening on port ${port}...`));
    } catch (err) {
        console.log(err);
    }
}

start();