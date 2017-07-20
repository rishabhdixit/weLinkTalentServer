Express & ES6 REST API Boilerplate
==================================

This is a straightforward boilerplate for building REST APIs with ES6 and Express.

- ES6 support via [babel](https://babeljs.io)
- REST resources as middleware via [resource-router-middleware](https://github.com/developit/resource-router-middleware)
- CORS support via [cors](https://github.com/troygoode/node-cors)
- Body Parsing via [body-parser](https://github.com/expressjs/body-parser)


Getting Started
---------------

```sh
# clone it
git clone https://gitlab.com/viseo-digital-squads/express-es6-api
cd express-es6-api

# Install dependencies
npm install or yarn install

# Start development live-reload server
PORT=8080 npm run dev

# Start production server:
PORT=8080 npm start
```
Docker Support
------
```sh
cd express-es6-rest-api

# Build your docker
docker build -t es6/api-service .
#            ^      ^           ^
#          tag  tag name      Dockerfile location

# run your docker
docker run -p 8080:8080 es6/api-service
#                 ^            ^
#          bind the port    container tag
#          to your host
#          machine port   

```

E2E Test
-------
 * First run the api server running on specific port.
 * Open Terminal, go to project directory.
 * Type this command in the terminal `ex. HOST=http://localhost:8080 npm run e2e`
 * See the result. (`Note. Run this always when we are going for production.`)

License
-------

MIT
