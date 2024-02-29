const Product = require("../models/product");

const getAllProducts = async (req, res) => {
  const { featured, company, name, sort, fields, numericFilter } =
    req.query; /* 1 */
  const queryObject = {};

  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (numericFilter) {
    const operatorMap = {
      /* 3 */ ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<": "$lt",
      "<=": "$lte",
    };
    const regEx = /\b(<|>|>=|=|<|<=)\b/g; /* 2 */
    let filters = numericFilter.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    ); /* 4 */
    //in the case where numericFilters has more than 1 option
    //console.log(filters); // price-$gt-50,rating-$gt-4
    //console.log(filters.split(",")); //["price-$gt-50", "rating-$gt-4"];
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      } /* 6 */
      console.log(queryObject); //{ price: { '$gt': 50 }, rating: { '$gt': 4 } }
    });
  }

  let result = Product.find(queryObject);
  if (sort) {
    //console.log(sort); //name,-price
    const sortList = sort.split(",").join(" ");
    //console.log(sortList); //name -price
    result = result.sort(sortList); /* 5 */
  } else {
    result = result.sort("createdAt");
  }

  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const products = await result;
  res.status(200).json({ products });
};

const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({ company: "ikea" });
  // const products = await Product.find({}); ** returns the entire array
  // const products = await Product.find({}).select('company createdAt').limit(5); ** returns a list of 5 objects with only the "company and createdAt" properties
  // if you want to use search and regex:
  // const search = 'ab'  **search results that contain a and b
  // const products = await Product.find({ name: { $regex: search, $options: 'i'   **for case insensitive },});

  res.status(200).json({ products });
};

module.exports = {
  getAllProductsStatic,
  getAllProducts,
};

/******** COMMENTS **********

*** 1:  The destructuring assignment const { featured, company, name, sort } = req.query; is extracting values from the req.query object. It's not concerned with whether the properties exist in the object or not; it simply assigns the corresponding values to the declared variables.
If the properties (featured, company, name, sort) exist in req.query, the variables will be assigned the corresponding values. If any of them are not present in req.query, the variables will be assigned the value undefined.

***2: The regular expression / \b(<|>|>=|=|<|<=)\b /g has the following components:

/: Delimiters that mark the start and end of the regular expression pattern.
g: A global flag that indicates the regular expression should be applied globally, meaning it will match all occurrences in the input string rather than stopping after the first match.
\b: A word boundary assertion. It matches a position where a word character (a-z, A-Z, 0-9, or _) is not followed or preceded by another word character. Essentially, it matches the boundary between a word character and a non-word character.
(<|>|>=|=|<|<=): This part of the pattern matches one of the specified comparison operators enclosed within word boundaries. The operators included are <, >, >=, =, and <=. The | character acts as an "OR" operator, allowing any of these operators to match. Parentheses () are used to group the options.

explanation on "\b" :
Imagine you're reading a book and you're looking for a specific word, let's say "cat". When you're searching for "cat", you're not interested in finding it as part of another word like "category" or "locate". You want to find it when it's all by itself, just "cat". That's what \b helps with.
Now, think of \b as a tiny marker that helps you find where a word starts or ends. It's like a little flag that says, "Hey, a word boundary is here!"
So, if you're looking for "cat" using \bcat\b, it's like saying, "Find me 'cat', but only when it's its own word, not part of another word."
For example:

In "cat", there's a word boundary before and after it, so it's a match.
In "category", there's no boundary before or after "cat", so it's not a match.
In "locate", "cat" is not on its own, so it's not a match either.

another example:
Match at the beginning of a word:

Regex: /test\b/
Input: "testify"
Explanation: This regex would match the \b position in "testify" because it occurs right before the letter 'y', marking the end of the word "test".
Match at the end of a word:

Regex: /\btest/
Input: "contest"
Explanation: This regex would match the \b position in "contest" because it occurs right after the letter 't', marking the end of the word "test".
Not match within a word:

Regex: /\btest\b/
Input: "testing"
Explanation: This regex would not match anything in "testing" because there is no word boundary around the word "test". The \b would fail to match between the letters 't' and 'i'.
Match around non-word characters:

Regex: /\btest\b/
Input: "test, testing"
Explanation: This regex would match the first occurrence of "test" because it's surrounded by word boundaries. However, it wouldn't match the second occurrence in "testing" because it's not surrounded by word boundaries.

***3: The operatorMap object maps textual comparison operators ">" to Mongoose comparison operators "$gt".
For example:
">" maps to "$gt" (greater than).

The function uses a regular expression (/\b(<|>|>=|=|<|<=)\b/g) to find these comparison operators in the numericFilter parameter.

***4: Once the comparison operators are identified, they are replaced with the corresponding Mongoose comparison operators using the operatorMap.
For example, if the input is price>=100, it's transformed to price-$gte-100.

***5: The reason why we need to split the sort options (if there were more than 1) is because sort() when provided more than 1 option, is separated by an empty space, like: sort(name price) and when the sort parameter is passed in the req.query it is separated by comas like: ?sort=price,name so it must be split(',') and then join('').

***6: queryObject[field] = { [operator]: Number(value) };
here we're adding a property in queryObject. the reason why we enclose the property in [] is because the property will change depending on what is passed to the req.query, in this case we are passing "price" and "rating" so we have to add these properties dynamicaly using []. if we instead wrote it like: queryObject.field = { operator: Number(value) }; then, the result would be: { field: { operator: 50 }, field: { operator: 4 } }

*/
