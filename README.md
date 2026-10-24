# striveBlog-EpicodeM6-MongoDB
Epicode Module 6 about MongoDB, ExpressJS

The project has two parts:

| Part | Folder | URL |
|---|---|---|
| Frontend (React) | project root | `http://localhost:3000` |
| Backend API (Express + MongoDB) | `backend/` | `http://localhost:9099` |

## Requirements

- Node.js
- A MongoDB Atlas connection string
- [Bruno](https://www.usebruno.com/) to test the API

## Setup

1. Install the dependencies (frontend and backend):
   ```
   npm install
   npm install --prefix backend
   ```
2. Create the file `backend/.env` (copy `backend/.env.example`) and add your connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
   ```
   The database used is `strive-blog`. The port is `9099` by default and can be changed with `PORT`.
3. Add the Cloudinary keys (Cloudinary dashboard → API Keys) to upload the images:
   ```
   CLOUDINARY_CLOUD_NAME=<cloud name>
   CLOUDINARY_API_KEY=<api key>
   CLOUDINARY_API_SECRET=<api secret>
   ```
4. Optional, for the emails: add the SendGrid key and the sender email. The sender must be verified in SendGrid (Settings → Sender Authentication).
   ```
   SENDGRID_API_KEY=SG.<sendgrid api key>
   SENDGRID_SENDER=<your verified email>
   ```
   Without them the API still works, the email error is only printed in the terminal.
5. Add a secret to sign the login tokens (any long random string):
   ```
   JWT_SECRET=<a long random string>
   ```
   You can generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
6. Add the Google keys to log in with Google. In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an **OAuth client ID** of type **Web application** and add `http://localhost:9099/auth/google/callback` to the **Authorized redirect URIs**:
   ```
   GOOGLE_CLIENT_ID=<google oauth client id>
   GOOGLE_CLIENT_SECRET=<google oauth client secret>
   GOOGLE_CALLBACK_URL=http://localhost:9099/auth/google/callback
   FRONTEND_URL=http://localhost:3000
   ```
   `FRONTEND_URL` is the page where the backend sends you back after the Google login. While the Google app is in **Testing**, only the accounts added as **test users** can log in.

If a required variable is missing, the backend doesn't start and prints its name.

## Run the app

Open two terminals in the project root:

```
npm run server
```
Wait for `Server is up and running on port 9099`.

```
npm start
```
The frontend opens at `http://localhost:3000`.

Without a token every page redirects to the login. Create an account on `/register`, then log in on `/login`: the token is saved in `localStorage` and you are sent to the homepage. **Esci** (logout) in the navbar removes the token. You can also use **Continua con Google** on `/login` or `/register` (see [Authentication](#authentication)).

## Project structure

### Frontend (project root)

| Folder | What's inside |
|---|---|
| `src/views/` | One folder per page: home, blog, new, authors, login, register, not-found |
| `src/components/` | Pieces shared by the pages: navbar, footer, blog (list, item, author), likes, Google button, protected route |
| `src/index.css` | Global styles used by many pages: font, page title, space under the navbar |
| `src/config.js` | `API_URL`, the address of the backend |

A page or component keeps its own styles in a `css/` folder inside its folder, in a file named after the component (never `styles.css`):

```
src/components/navbar/
├── BlogNavbar.jsx       imports "./css/BlogNavbar.css"
└── css/
    └── BlogNavbar.css   only the navbar's styles
```

A style used by more than one page goes in `src/index.css`. A page or component without its own styles has no `css/` folder (e.g. `footer/`, `login/`).

### Backend (`backend/`)

```
backend/
├── server.js            starts the API: checks .env, connects to MongoDB, listens on PORT
├── app.js               the Express app: global middlewares, routes, 404 and errors
├── config/
│   ├── env.js           required .env variables (the server stops if one is missing)
│   ├── db.js            MongoDB connection
│   └── cloudinary.js    Cloudinary account
├── middlewares/         shared by every module
│   ├── verifyToken.js   checks the JWT and puts the logged-in author in request.author
│   ├── validate.js      runs the express-validator rules, keeps only the allowed fields
│   ├── upload.js        multer + Cloudinary: images only, max 5 MB
│   ├── notFound.js      JSON 404 for unknown routes
│   └── errorHandler.js  turns every error into a JSON response
├── modules/             one folder per feature
│   ├── auth/            login, /me and Google login (google.strategy.js)
│   ├── authors/
│   ├── blogPosts/
│   └── comments/        saved inside the posts: comment.schema.js, not a model
└── utils/
    ├── HttpError.js     an error with an HTTP status
    ├── pagination.js    ?page and ?perPage → paginated response
    └── sendEmail.js     emails with SendGrid
```

Every module has the same files, named after the module (e.g. `authors.routes.js`):

| File | Job |
|---|---|
| `*.routes.js` | The URLs of the module. Each route lists its steps in order: token, ownership check, validation, upload, controller |
| `*.validators.js` | The [express-validator](https://express-validator.github.io/) rules for the request body |
| `*.middlewares.js` | Checks that belong to the module, e.g. `isPostAuthor` (only the author can change a post) |
| `*.controller.js` | Reads the request, calls the service, sends the response. No database code |
| `*.service.js` | The logic and the database queries. Throws an `HttpError` when something is missing or not allowed |
| `*.model.js` | The Mongoose model (`comment.schema.js` is only a schema, used inside `BlogPost`) |

### How a request flows

Example: `PUT /blogPosts/:id`

```
app.js              verifyToken          who is calling → request.author (401 without a valid token)
blogPosts.routes    isPostAuthor         403 if the post belongs to someone else
                    validate(rules)      400 if a field is wrong, removes the fields without a rule
                    controller.update    calls blogPostsService.update(id, body), sends the result
blogPosts.service   findByIdAndUpdate    404 if the post doesn't exist
errorHandler        any error above      { "message": "..." } with the right status code
```

### Conventions

- **Errors**: throw `new HttpError(status, message)` from a service or a middleware, e.g. `throw new HttpError(404, "Author not found")`. `errorHandler.js` builds every error response, so routes never send errors by hand. Express 5 forwards the errors of `async` functions to it, so no `try/catch` is needed.
- **Validation**: every route that receives a body has its rules in `*.validators.js`. Fields without a rule never reach the database (e.g. an `author` or `googleId` sent by the client).
- **Ownership** checks run before uploads, so no file is sent to Cloudinary for something the user can't change.
- **Between modules**: a module can use another module's service or model (deleting an author calls `blogPostsService.removeByAuthor` and `commentsService.removeByAuthor`), never its routes or controller.
- **Passwords** are hashed only in the Author model (`pre('save')` and `pre('findOneAndUpdate')`) and never sent back.
- **Environment**: a new variable goes in `backend/.env.example` and, if the API can't work without it, in `config/env.js`.

### Adding a feature

Example: likes on the posts.

1. Create `backend/modules/likes/` with the files you need, named like the others: `like.model.js`, `likes.service.js`, `likes.controller.js`, `likes.routes.js`, plus `likes.validators.js` and `likes.middlewares.js` if the routes need them.
2. Write them from the bottom up: model → service → controller → validators → routes.
3. Mount the router in `app.js`, e.g. `app.use('/blogPosts', verifyToken, blogPostsRoutes, commentsRoutes, likesRoutes)`.
4. Add the new routes to [Test the API with Bruno](#test-the-api-with-bruno).

## Test the API with Bruno

Bruno must call the **backend** (`http://localhost:9099`), not the frontend on port 3000.

1. Create a new collection (e.g. "Strive Blog").
2. Optional: go to **Environments → Configure → Create**, add the variable `baseUrl` = `http://localhost:9099` and select the environment in the top-right dropdown.
3. Create a request, choose the method, write the URL and press **Send** (Ctrl+Enter).
4. For `POST` and `PUT` open the **Body** tab and choose **JSON**.

Quick check (with the token, see below): `GET {{baseUrl}}/` should return `{ "message": "Welcome to Epi-StriveBlog" }`.

### Authentication

All the routes need a token, except `POST /login`, `POST /authors` (the registration) and the Google login (but `POST /auth/google/link` needs it).

| Method | URL | Description |
|---|---|---|
| POST | `{{baseUrl}}/login` | Returns the access token (valid for 1 day) |
| GET | `{{baseUrl}}/me` | The user of the token, with `googleLinked` (`true` if a Google account opens it) |
| GET | `{{baseUrl}}/auth/google` | Login with Google (in the browser, see below) |
| GET | `{{baseUrl}}/auth/google/callback` | Google sends you back here after the login |
| POST | `{{baseUrl}}/auth/google/token` | Used by the frontend after the Google login: returns the token saved in the login cookie |
| POST | `{{baseUrl}}/auth/google/link` | **Collega Google** (with the token): saves who you are in a cookie, then the frontend opens `/auth/google?link=1` (see below) |

Example body for `POST /login`:
```json
{
  "email": "mario@example.com",
  "password": "secret123"
}
```

Response: `{ "accessToken": "eyJhbGciOi..." }`

**Login with Google** works in the browser, not in Bruno: click **Continua con Google** on `/login` or `/register` (or open `http://localhost:9099/auth/google`). It logs you in or, the first time, creates your account.

1. The backend sends you to Google with a random `state` and saves the same `state` in a cookie of your browser.
2. When Google sends you back, the backend checks that the `state` matches the cookie, so the login must have started in this browser: nobody can log you into their account by sending you a link.
3. It finds the author created or linked with this Google account in an earlier login or, the first time, creates it with name, surname, email and photo from Google (no password and no `dob`, so this author logs in only with Google). If the email already belongs to an account registered with a password, the login is refused: anyone can register someone else's email, so Google opens those accounts only after **Collega Google** (see below).
4. It saves the token (the same as `POST /login`) in a cookie that lasts 1 minute and that JavaScript can't read, then redirects to `http://localhost:3000/login?google=success`.
5. The frontend calls `POST /auth/google/token`, which sends back the token and deletes the cookie. The frontend saves the token: it never appears in the address bar, the browser history or the server logs.

The cookies are `SameSite=Lax`, so the frontend and the backend must be on the same site (here both on `localhost`).

**Collega Google** links a Google account to an account registered with a password. Log in with email and password and click **Collega Google** in the navbar (it disappears once Google is linked):

1. The frontend calls `POST /auth/google/link` with your token. The backend saves who you are in a signed cookie that lasts 15 minutes and that JavaScript can't read.
2. The frontend opens `http://localhost:9099/auth/google?link=1` and the Google login runs as above, with the same `state` check.
3. When Google sends you back, the backend finds the cookie and saves the Google account on your author instead of creating a new one.

From then on **Continua con Google** opens your account. This is safe because you have proved both things: you know the password and you own the Google account. A Google account opens one author only, and a normal **Continua con Google** deletes the cookie of a **Collega Google** left halfway.

If you cancel on Google, Google has not verified the email, the `state` doesn't match, or something goes wrong during the login, you go back to `http://localhost:3000/login?error=google` and the page shows *accesso con Google annullato o non completato, riprova* (errors are printed in the backend terminal). If the email already has an account with a password, you go back to `http://localhost:3000/login?error=google-email` and the page asks you to log in with email and password and then use **Collega Google**. If **Collega Google** uses a Google account that already opens another author, you go back to `http://localhost:3000/login?error=google-linked`.

To send the token with every request:

1. Add the variable `token` to the environment and paste the `accessToken` as its value.
2. Open the collection settings → **Auth**, choose **Bearer Token** and write `{{token}}`.
3. In each request the **Auth** tab must be **inherit** (it sends the header `Authorization: Bearer <token>`).

Everyone can read, but you can change only your own data: `PUT`, `PATCH` and `DELETE` work only on your own profile, posts and comments (otherwise `403`).

### Authors

| Method | URL | Description |
|---|---|---|
| GET | `{{baseUrl}}/authors?page=1&perPage=10` | List of authors (paginated, alphabetical) |
| GET | `{{baseUrl}}/authors/:id` | One author |
| GET | `{{baseUrl}}/authors/:id/blogPosts` | All the posts of one author |
| POST | `{{baseUrl}}/authors` | Create an author with an encrypted password (registration, no token needed, sends a welcome email) |
| PUT | `{{baseUrl}}/authors/:id` | Update your profile |
| PATCH | `{{baseUrl}}/authors/:authorId/avatar` | Upload your avatar to Cloudinary and save its URL |
| DELETE | `{{baseUrl}}/authors/:id` | Delete your profile, all your posts and your comments |

Example body for `POST /authors`:
```json
{
  "name": "Mario",
  "surname": "Rossi",
  "email": "mario@example.com",
  "dob": "1990-01-01",
  "avatar": "https://ui-avatars.com/api/?name=Mario+Rossi",
  "password": "secret123"
}
```

Rules: `name` and `surname` not empty, a valid `email`, `dob` as `YYYY-MM-DD`, `avatar` a URL and `password` at least 8 characters. `POST` needs all of them, `PUT` only the fields you want to change. Any other field is ignored.

The password is saved encrypted with bcrypt and is never sent back in the responses.

### Blog posts

| Method | URL | Description |
|---|---|---|
| GET | `{{baseUrl}}/blogPosts?page=1&perPage=10&title=react` | List of posts (paginated, newest first, optional search by title) |
| GET | `{{baseUrl}}/blogPosts/:id` | One post |
| POST | `{{baseUrl}}/blogPosts` | Create a post (the author is the logged-in user, who gets an email) |
| PUT | `{{baseUrl}}/blogPosts/:id` | Update your post (the author can't be changed) |
| PATCH | `{{baseUrl}}/blogPosts/:blogPostId/cover` | Upload the cover of your post to Cloudinary and save its URL |
| DELETE | `{{baseUrl}}/blogPosts/:id` | Delete your post |

Example body for `POST /blogPosts` (no `author`, it comes from the token):
```json
{
  "category": "Tech",
  "title": "My first post",
  "cover": "https://picsum.photos/600/300",
  "readTime": { "value": 5, "unit": "minute" },
  "content": "<p>Hello world</p>"
}
```

Rules: `category`, `title` and `content` not empty, `cover` a URL, `readTime.value` a number greater than 0 and `readTime.unit` not empty. Any other field (e.g. `author` or `comments`) is ignored.

### Comments

The comments are embedded in the post (the `comments` array of each post). The author of a comment is the logged-in user, so the body has only the `text`. In the responses `author` is an object with `name`, `surname` and `avatar`.

| Method | URL | Description |
|---|---|---|
| GET | `{{baseUrl}}/blogPosts/:id/comments` | All the comments of one post |
| GET | `{{baseUrl}}/blogPosts/:id/comments/:commentId` | One comment of one post |
| POST | `{{baseUrl}}/blogPosts/:id` | Add a comment to a post |
| PUT | `{{baseUrl}}/blogPosts/:id/comment/:commentId` | Update your comment |
| DELETE | `{{baseUrl}}/blogPosts/:id/comment/:commentId` | Delete your comment |

Example body for `POST /blogPosts/:id` and `PUT /blogPosts/:id/comment/:commentId`:
```json
{
  "text": "Great post!"
}
```

### Upload an image

For `PATCH /authors/:authorId/avatar` and `PATCH /blogPosts/:blogPostId/cover`:

1. Open the **Body** tab and choose **Multipart Form**.
2. Add a field named `avatar` (for authors) or `cover` (for posts) and set its type to **File**.
3. Select the image and press **Send**.

Only images (e.g. JPG or PNG) up to 5 MB are accepted. The image is saved in the `strive-blog` folder on Cloudinary, and the response is the author or post with the new Cloudinary URL.

### Notes

- Create an author first, then log in. Use the `_id` from the response in the `/:id` routes.
- The `author` field of a post saves the author's **`_id`** (taken from the token) as a reference to the `Author` model. The routes use `populate()`, so in the responses `author` is an object with `name`, `surname`, `email` and `avatar`.
- `perPage` goes from 1 to 100 (default 10).
- `PUT` accepts only the fields you want to change.

### Errors

Every error has the same JSON shape, e.g. `{ "message": "Author not found" }`. When the body doesn't follow the rules, `errors` lists every wrong field and `message` is the first one:

```json
{
  "message": "Password must be at least 8 characters",
  "errors": [
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Invalid data (see `errors`), invalid ID or invalid JSON, or an upload without an image, not an image, over 5 MB or in the wrong field |
| 401 | Missing, invalid or expired token, or wrong email or password |
| 403 | Not your profile, post or comment |
| 404 | Not found (also an unknown route) |
| 409 | Email already in use, or the post was changed by another request at the same time (try again) |
| 500 | Server error, the details are printed only in the server terminal |

## MongoDB Compass queries (W2D1)

The queries and the number of results are in [queries/W2D1.md](queries/W2D1.md).
