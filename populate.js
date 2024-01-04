require('dotenv').config();

const connectDB = require('./connectDB/connect');
const Product = require('./models/product');
const jsonProducts = require('./products.json');

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        await Product.deleteMany();     /* 1 */
        await Product.create(jsonProducts);
        console.log('connected to DB'); 
        process.exit(0);     /* 2 */
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

start();


/************** COMMENTS **************

*** 1: We want to remove all the products that are currently in the Data base (deleteMany) and then we want to use the (create) and just pass in the jsonProduct and by doing so of course we'll add all of these products to our database. We do this so that if you want to use it and added some gibberish or whatever data you currently have you just remove it first and
then you start from scratch.

*** 2: process.exit(0) and process.exit(1) are used to terminate the Node.js process with different exit codes.
process.exit(0): This line indicates a successful termination of the Node.js process. The argument 0 passed to process.exit() signifies that the process is exiting without any errors. In Unix-like operating systems, an exit code of 0 conventionally indicates success. So, when the script successfully connects to the database, deletes documents, creates new documents, and logs "connected to DB," it terminates the process with exit code 0. 
process.exit(1): This line is reached if an error occurs during the execution of the try block. The process.exit(1) line indicates an abnormal termination of the Node.js process due to an error. The argument 1 passed to process.exit() signifies that the process is exiting with an error.

 */