const Product = require('../models/product');

const getAllProducts = async (req, res) => {
    const { featured, company, name, sort, fields, numericFilter } = req.query;  /* 1 */
    const queryObject = {};

    if(featured) {
        queryObject.featured = featured === 'true' ? true : false;
    }
    if(company) {
        queryObject.company = company;
    }
    if(name) {
        queryObject.name = { $regex: name, $options: 'i' };
    }
    if(numericFilter) {
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte',
        };
        const regEx = /\b(<|>|>=|=|<|<=)\b/g;
        let filters = numericFilters.replace(
          regEx,
          (match) => `-${operatorMap[match]}-`
        );
        const options = ['price', 'rating'];
        filters = filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('-');
            if (options.includes(field)) {
                queryObject[field] = { [operator]: Number(value) };
            }
        });
    }
    console.log(queryObject);

    let result = Product.find(queryObject);
    if(sort) {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList);
    } else {
        result = result.sort('createdAt');
    }

    if(fields) {
        const fieldsList = fields.split(',').join(' ');
        result = result.select(fieldsList);
    }
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;  

    result = result.skip(skip).limit(limit);

    const products = await result;
    res.status(200).json({ products });
}

const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({ company: 'ikea' });
    // const products = await Product.find({}); ** returns the entire array
    // const products = await Product.find({}).select('company createdAt').limit(5); ** returns a list of 5 objects with only the "company and createdAt" properties
    // if you want to use search and regex:
    // const search = 'ab'  **search results that contain a and b
    // const products = await Product.find({ name: { $regex: search, $options: 'i'   **for case insensitive },});

    res.status(200).json({ products });
}

module.exports = {
    getAllProductsStatic,
    getAllProducts,
}

   /******** COMMENTS **********

*** 1:  The destructuring assignment const { featured, company, name, sort } = req.query; is extracting values from the req.query object. It's not concerned with whether the properties exist in the object or not; it simply assigns the corresponding values to the declared variables.
If the properties (featured, company, name, sort) exist in req.query, the variables will be assigned the corresponding values. If any of them are not present in req.query, the variables will be assigned the value undefined.*/