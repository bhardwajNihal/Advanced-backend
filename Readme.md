
-> how to configure a professional backend project 

1. initialize empty node project - npm init -y
2. make an empty folder public/temp and a .gitkeep(facilitates pushing empty folders to git) file init
3. add a .gitignore file, (use a gitignore generator)
4. create a .env file to store all the environment variables, and sensitive info that isn't to be pushed
5. create a src folder and necessary files init - app.js, constants.js, index.js
6. add type as module in pakage to json, to use the import syntax
7. install nodemon as dev-dependency for live server reload  --> npm i -D nodemon 
8. add required scripts
9. Create necessary folders inside src that serves different purposes, for better project structure: 
    - controllers --> for functionalities
    - db  --> for databases connections
    - middlewares  --> for authentications, etc
    - models  --> to define schemas and models for databases using ORMS
    - routes  --> separate folders for defining routes
    - utils  --> for utilities that are used repeatedly throughout the project, like file, media upload, etc.

10. Configure mongoDb, get the compass, and the connection string
11. add PORT AND mongodb connection string to the .env file
12. install necessary pakages - express, mongoose, dotenv, jsonwebtoken

13. Connect to Database, with gracefully handling exceptions, wrapping it in try catch block. use throw or exit process accordinly

14. import the Db connection function. 
15. use the import syntax for configuring .env, adding a script as : 
    - "scripts": {
         "dev": "nodemon -r dotenv/config src/index.js"
        },
        - nodemon starts, monitoring your files for changes.
        - dotenv/config preloads, so your .env variables are available in process.env for your app.
        - nodemon runs the index.js file from the specified directory (src/node).
15. start the server, 

16. Some important npm packages to be imported in our express App : 
    - cors  ==> to enable cross origin resourse sharing
    - cookie-parser ==> to safely access user cookies

17. standard approach to creating database schemas and models

18. custom api responses
    - success response
    - custom ApiError response
    - global error handler middleware
    - catch async - a higher order function to wrap the async functions and handling try catch for each