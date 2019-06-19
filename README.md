[![General Assembly Logo](https://camo.githubusercontent.com/1a91b05b8f4d44b5bbfb83abac2b0996d8e26c92/687474703a2f2f692e696d6775722e636f6d2f6b6538555354712e706e67)](https://generalassemb.ly/education/web-development-immersive)

# Express as an API

## Prerequisites

- [node-api](https://git.generalassemb.ly/ga-wdi-boston/node-api)
- [mongoose](https://git.generalassemb.ly/ga-wdi-boston/mongoose)

## Objectives

By the end of this, developers should be able to:

- Write five CRUD endpoints for an API resource using Express, Mongoose, and
  JavaScript.
- Prevent unauthorized users from creating or changing data through the API.

## Preparation

1. Create a new branch, `training`, for your work.
1. Checkout to the `training` branch.
1. Install dependencies with `npm install`.
1. Verify mongodb is running with `brew services list`
   (Run `brew services restart mongodb` if not).

## Overview

According to its maintainers:

> Express is a minimal and flexible Node.js web application framework that
> provides a robust set of features for web and mobile applications.

Express, like Rails, can be used as an API. In fact, building APIs in Express,
especially those that use MongoDB for persistence, led to the rising popularity
of Node.

Express can be used for full-stack applications (those that have server-rendered
views). However, we will use it purely as an API.

A customized template for Express is available at [express-api-template](https://git.generalassemb.ly/ga-wdi-boston/express-api-template).
It includes authentication and common middlewares so that you can start
developing an API right away.

## Demo: "Hello World" API

Let's take a look at a super simple Express application. Open up
[lib/tiny_server.js](lib/tiny_server.js). This is a fully functional Express
API, in just four lines of code! We can run it like this:

```sh
node lib/tiny_server.js
```

And we can make a request to it like this:

```sh
curl --include localhost:4741
```

## Code-along: Library API

Most apps need to do a bit more than always sending back "Hello world". To get
some more exposure to Express, let's build out a minimal API in
[lib/medium_size_server.js](lib/medium_size_server.js) that we can
use to store books for a library. Because we haven't learned how
to integrate MongoDB (or other databases) into Express yet, we'll just store our
data in memory.

Our app will have three routes available:

- `GET /books`: respond with JSON of all books, like `index` in Rails.
- `GET /books/:id`: respond with JSON of one book, like `show` in Rails.
- `POST /books`: accept JSON and create a book from it, then respond with
  the created book.

Our API will need more functionality than the previous example. Nonetheless, we'll
utilize a lot of the same patterns. For example, what were those `req` and `res` parameters
exactly?

`req` stands for request, and it contains lots of info about the incoming HTTP
request that the server receives. It contains things like the URI path, HTTP
headers, the HTTP verb (GET, POST, etc.), query parameters, parameters from
dynamic route segments, and more.

`res` stands for response. We use this object to put together a response, and
then we send that response with methods attached to this object. Some of these
are:

| Response method      | What it means                                                                         |
|:---------------------|:--------------------------------------------------------------------------------------|
| `res.json(jsObject)` | Send a JSON response.                                                                 |
| `res.redirect()`     | Redirect a request.                                                                   |
| `res.sendStatus()`   | Set the response status code and send its string representation as the response body. |

To accept a POST request with data attached to it, we'll need to parse the body
of the HTTP request into a JS object. Because Express is minimal and doesn't
make assumptions about what its users will try to do with it, this isn't
included by default. Luckily, Express is easy to extend with plugins called
"middlewares".

[Middlewares](https://expressjs.com/en/guide/using-middleware.html) are
functions that can operate on the `req` and `res` objects in an Express app
after a request is received and before a response is sent. You can register a
middleware with `app.use(myMiddlewareFunc)`. The order in which you pass them
to `.use` determines the order in which they execute. A simple middleware might
look like this:

```js
const exampleMiddleware = function (req, res, next) {
  // do something with `req` or `res`
  next()
}
```

Almost all middlewares will have `(req, res, next)` as parameters. `req` and
`res` are the standard Express request and response objects. `next` is a
function that every middleware must invoke to pass control on to the next
middleware in the chain. Otherwise, the request will hang and the client won't
get a response!

In the case of our API though, we'll use a pre-existing middleware from an
NPM package named [body-parser](https://www.npmjs.com/package/body-parser)
instead of writing our own.

## Our Express API Template

Now that we've taken a look at some simpler Express apps, let's see a real one!
This repo includes a copy of our
[express-api-template](https://git.generalassemb.ly/ga-wdi-boston/express-api-template).

It's a minimal but
full-featured Express API. It comes with token-based authentication, error
handling, and a set of example routes for you to reference as you build your
own routes.

## Lab: Investigate Express API template

Take a few minutes to read through the `express-api-template`
[README](https://git.generalassemb.ly/ga-wdi-boston/express-api-template#structure),
particularly the section labelled "Structure". Then, with your team, begin
looking around the code in this repo, starting with `server.js`.

**Note:** Don't worry about `app/routes/example_routes.js` yet. We'll talk
about that in detail together.

Some questions to discuss with your teammates:

- What middlewares can you identify in `server.js`?
- Where do we add routes to the `app` object?
- Is there anyting in the `app/models` directory that's not familar from the
  Mongoose lesson?
- What NPM package are we using for authentication?
- Which file is responsible for setting HTTP status codes when something goes
  wrong (e.g. 422, 500, 401)?
- Where is the code that creates and stores tokens?

We'll go over your responses to these questions together.

## Building a Bookstore API

We've been hired to write an API for a local bookstore, 'Book Before You Leap'.
They have plans to expand in the next few years, and they'll probably rival
Amazon. Therefore, we've chosen Express because it's hip, and Mongo because it's
Web Scale™.

Let's get acquainted with how we'll use Express.

## Demo: Express Routes at a Glance

Let's take a look at `app/routes/example_routes.js`. This is what we'll call a
"route handler". It looks a bit like a Rails controller, but we won't call it a
controller because it has more responsibilities -- it's kind of like a router,
controller, and serializer all bundled up together. Remember, Express is highly
_un_-opinionated, so Express apps are free to use whatever structure makes the
most sense for a given project. We chose this pattern for the template because
it puts all the behavior for a resource in one place in a transparent way.

There are lots of files being required here! Let's talk briefly about what each
does.

After all the files are `require`ed, we call `express.Router()`. This method
creates a new router object that we can attach a number of routes to using
the same syntax we used to attach routes to `app` in the previous examples.
So, instead of `app.get('/hello')`, we'd do `router.get('/hello')`. This makes
it so we only have to register one route per resource in `server.js`. Let's
flip back to that file so we can see how these `router` objects are used.

Now we'll look at the routes themselves. You may notice that each route takes
a callback with the signature `(req, res)`. These are the same `req` and `res`
that we used earlier.

To get a little more specific, the `req` object is a
[http.IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
object. The `res` object is
[http.ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse)
object. Notice that the above links point to the NodeJS docs. These objects are
actually native to Node, not Express.

You'll notice that almost all the routes have a call to `res.json`. What's
that?

`res.json` signals to Express that we're done working on our response.
It's analogous to Rails' `render` method. If you don't use a **terminal
handler**, Express will keep the connection open waiting for one. You and
Express will both be frustrated and confused. Here's a list of terminal
handlers. You will use `res.json` and `res.sendStatus` most frequently.

| Response method      | What it means                                                                         |
|:---------------------|:--------------------------------------------------------------------------------------|
| `res.json(jsObject)` | Send a JSON response.                                                                 |
| `res.redirect()`     | Redirect a request.                                                                   |
| `res.sendStatus()`   | Set the response status code and send its string representation as the response body. |

## Annotate Along: Index Action

Let's practice reading unfamiliar code by annotating
[`app/routes/example_routes.js`](app/routes/example_routes.js). As we read the
index action, keep the following questions in mind.

- What is the purpose of this action?
- How is the action handling errors?
- Can unauthenticated users access this action?
- Does this action show all "examples", or just the ones that belong to the
  currently signed-in user?
- Which terminal handler is used to send a response?

## Demo: An Example Express Model

Let's read [`app/models/example.js`](app/models/example.js) and answer the
following questions together:

- What library are we using to model our resources? Does it have anything to
  do with Express?
- Where should we go to find out more about an owner?

## Lab: Create a book model

Before we can build out a route handler for books, we'll need a model. Create a
file called `book.js` in the `models` directory, and complete it, using the
example model for guidance.

The book model should have these properties:

- `title`, which should be a string, and should be required.
- `author`, which should be a string and should be required.
- `firstPublished`, which should be a date.
- `originalLanguage`, which should be a string.
- `owner`, which should be reference to the user model. It should also be required.

## Code-Along: `GET /books`

**Visitors to the client web application should be able to see all the books**
**without being logged in.**

We will need to write a route handler and a test script.

Expected response:

```sh
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8

{
  "books": [
    {
      "_id": "56df974ec19957cb0d836c4c",
      "updatedAt": "2016-03-09T03:23:58.000Z",
      "createdAt": "2016-03-09T03:23:58.000Z",
      "owner": "56df9716c19957cb0d836c4a",
      "title": "Between the World and Me",
      "author": "Ta-Nehisi Coates",
      "originalLanguage": "English",
      "firstPublished": 1999,
      "__v": 0
    },
    {
      "_id": "56df974ec19957cb0d836c4d",
      "updatedAt": "2016-03-09T03:23:58.000Z",
      "createdAt": "2016-03-09T03:23:58.000Z",
      "owner": "56df9716c19957cb0d836c4a",
      "title": "Invisible Monsters",
      "author": "Chuck Palahniuk",
      "originalLanguage": "Spanish",
      "firstPublished": 1843,
      "__v": 0
    }
  ]
}
```

## Code-Along: Add Books to the database

Because books are "owned" by users, we can't create books without first creating
users. Luckily, the script will do that for us! We just need to pass it an email
and password and it will create a user with those credentials.

Run the load-books script like this:

```bash
node scripts/load_books.js bob@website mypassword
```

## Annotate-Along: `GET /examples/:id`

## Code-Along: `GET /books/:id`

**Visitors to the client web application should be able to see any book without being logged in.**

You will need to write a route handler and a test script.

Expected response:

```sh
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8

{
  "book": {
    "_id": "56df974ec19957cb0d836c4c",
    "updatedAt": "2016-03-09T03:23:58.000Z",
    "createdAt": "2016-03-09T03:23:58.000Z",
    "owner": "56df9716c19957cb0d836c4a",
    "title": "Between the World and Me",
    "author": "Ta-Nehisi Coates",
    "originalLanguage": "English",
    "firstPublished": 1999,  "__v": 0
  }
}
```

## Annotate-Along: `DELETE /examples/:id`

## Lab: `DELETE /books/:id`

**Only authenticated users should be able to delete a book. They should not be**
**able to delete other users' books.**

You will need to write a route handler and a test script.

Expected response:

```sh
HTTP/1.1 204 No Content
X-Powered-By: Express
```

If a different user than the owner tries to make the change, you should instead
see:

```sh
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 111
ETag: W/"6f-kZ8KCT7LKfkTau/j2iSIvjLlBpA"
Date: Thu, 29 Mar 2018 19:38:29 GMT
Connection: keep-alive

{"name":"OwnershipError","message":"The provided token does not match the owner of this document","status":401}
```

## Annotate-Along: `PATCH /examples/:id`

## Code-Along: `PATCH /books/:id`

**Only authenticated users should be able to change a book. They should not be**
**able to change other users' books.**

You will need to write a route handler and a test script.

Expected response:

```sh
HTTP/1.1 204 No Content
X-Powered-By: Express
```

You may wish to retrieve the book you changed to check your work.

If a different user than the owner tries to make the change, you should instead
see:

```sh
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 111
ETag: W/"6f-kZ8KCT7LKfkTau/j2iSIvjLlBpA"
Date: Thu, 29 Mar 2018 19:38:29 GMT
Connection: keep-alive

{"name":"OwnershipError","message":"The provided token does not match the owner of this document","status":401}
```

## Annotate-Along: `POST /examples`

## Lab: `POST /books`

**Only authenticated users should be able to create a book.**

You will need to write a route handler and a test script.

Make sure to save a reference to the user that created the book so it can be
used to check ownership.

You're done when you see a response similar to this one:

Expected response:

```sh
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8

{
  "book": {
    "__v": 0,
    "updatedAt": "2016-03-09T03:23:58.000Z",
    "createdAt": "2016-03-09T03:23:58.000Z",
    "owner": "56df9716c19957cb0d836c4a",
    "title": "Invisible Monsters",
    "author": "Chuck Palahniuk",
    "originalLanguage": "Spanish",
    "firstPublished": 1843
    "_id": "56df974ec19957cb0d836c4d",
    "editable": true
  }
}
```

If an unauthenticated user tries to create a book, you should instead see:

```sh
HTTP/1.1 401 Unauthorized
X-Powered-By: Express
WWW-Authenticate: Bearer realm="Users"
Date: Thu, 29 Mar 2018 19:41:57 GMT
Connection: keep-alive
Content-Length: 12

Unauthorized
```

## Challenge

Write a node script to scaffold a route handler.

## Additional Resources

- [Express - Node.js web application framework](http://expressjs.com/)
- [Understanding Express.js](https://evanhahn.com/understanding-express/)
- [ga-wdi-boston/express-api-template: Minimal express server](https://git.generalassemb.ly/ga-wdi-boston/express-api-template)
- [How body parser works](https://medium.com/@adamzerner/how-bodyparser-works-247897a93b90)

## [License](LICENSE)

1. All content is licensed under a CC­BY­NC­SA 4.0 license.
1. All software code is licensed under GNU GPLv3. For commercial use or
    alternative licensing, please contact legal@ga.co.
