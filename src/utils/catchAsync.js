// Async Error Catcher
// Normally with async functions, we’d need try-catch everywhere. Instead, we wrap them with this utility.

// A higher-order function (i.e., a function that takes another function)
// It automatically wraps our async route so you don’t have to write try/catch every time.

export function catchAsync(asyncFunc) {
    return function (req, res, next) {
      // run the async function
      // if it throws error, .catch(next) sends it to global error handler
      asyncFunc(req, res, next).catch(next);
    };
  }
  

// it use in the route handlers 
    // const catchAsync = require("./utils/catchAsync");

    // app.get("/users", catchAsync(async (req, res, next) => {
    // const result = await fetchUsers();            // no manual try catch in every route
    // res.json(result);
    // }));
