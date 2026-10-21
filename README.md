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
   SENDGRIND_API_KEY=SG.<sendgrid api key>
   SENDGRID_SENDER=<your verified email>
   ```
   Without them the API still works, the email error is only printed in the terminal.
5. Add a secret to sign the login tokens (any long random string):
   ```
   JWT_SECRET=<a long random string>
   ```
   You can generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

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

Without a token every page redirects to the login. Create an account on `/register`, then log in on `/login`: the token is saved in `localStorage` and you are sent to the homepage. **Esci** (logout) in the navbar removes the token.

## Test the API with Bruno

Bruno must call the **backend** (`http://localhost:9099`), not the frontend on port 3000.

1. Create a new collection (e.g. "Strive Blog").
2. Optional: go to **Environments → Configure → Create**, add the variable `baseUrl` = `http://localhost:9099` and select the environment in the top-right dropdown.
3. Create a request, choose the method, write the URL and press **Send** (Ctrl+Enter).
4. For `POST` and `PUT` open the **Body** tab and choose **JSON**.

Quick check (with the token, see below): `GET {{baseUrl}}/` should return `{ "message": "Welcome to Epi-StriveBlog" }`.

### Authentication

All the routes need a token, except `POST /login` and `POST /authors` (the registration).

| Method | URL | Description |
|---|---|---|
| POST | `{{baseUrl}}/login` | Returns the access token (valid for 1 day) |
| GET | `{{baseUrl}}/me` | The user of the token |

Example body for `POST /login`:
```json
{
  "email": "mario@example.com",
  "password": "secret123"
}
```

Response: `{ "accessToken": "eyJhbGciOi..." }`

To send the token with every request:

1. Add the variable `token` to the environment and paste the `accessToken` as its value.
2. Open the collection settings → **Auth**, choose **Bearer Token** and write `{{token}}`.
3. In each request the **Auth** tab must be **inherit** (it sends the header `Authorization: Bearer <token>`).

Everyone can read, but you can change only your own data: `PUT`, `PATCH` and `DELETE` work only on your own profile and on your own posts (otherwise `403`).

### Authors

| Method | URL | Description |
|---|---|---|
| GET | `{{baseUrl}}/authors?page=1&perPage=10` | List of authors (paginated, alphabetical) |
| GET | `{{baseUrl}}/authors/:id` | One author |
| GET | `{{baseUrl}}/authors/:id/blogPosts` | All the posts of one author |
| POST | `{{baseUrl}}/authors` | Create an author with an encrypted password (registration, no token needed, sends a welcome email) |
| PUT | `{{baseUrl}}/authors/:id` | Update your profile |
| PATCH | `{{baseUrl}}/authors/:authorId/avatar` | Upload your avatar to Cloudinary and save its URL |
| DELETE | `{{baseUrl}}/authors/:id` | Delete your profile and all your posts |

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

### Comments

The comments are embedded in the post (the `comments` array of each post).

| Method | URL | Description |
|---|---|---|
| GET | `{{baseUrl}}/blogPosts/:id/comments` | All the comments of one post |
| GET | `{{baseUrl}}/blogPosts/:id/comments/:commentId` | One comment of one post |
| POST | `{{baseUrl}}/blogPosts/:id` | Add a comment to a post |
| PUT | `{{baseUrl}}/blogPosts/:id/comment/:commentId` | Update a comment |
| DELETE | `{{baseUrl}}/blogPosts/:id/comment/:commentId` | Delete a comment |

Example body for `POST /blogPosts/:id`:
```json
{
  "text": "Great post!",
  "author": "Mario"
}
```

### Upload an image

For `PATCH /authors/:authorId/avatar` and `PATCH /blogPosts/:blogPostId/cover`:

1. Open the **Body** tab and choose **Multipart Form**.
2. Add a field named `avatar` (for authors) or `cover` (for posts) and set its type to **File**.
3. Select the image and press **Send**.

The image is saved in the `strive-blog` folder on Cloudinary, and the response is the author or post with the new Cloudinary URL.

### Notes

- Create an author first, then log in. Use the `_id` from the response in the `/:id` routes.
- The `author` field of a post saves the author's **`_id`** (taken from the token) as a reference to the `Author` model. The routes use `populate()`, so in the responses `author` is an object with `name`, `surname`, `email` and `avatar`.
- `perPage` goes from 1 to 100 (default 10).
- `PUT` accepts only the fields you want to change.
- Response codes:

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Missing required field (also email or password at login), invalid ID or no image uploaded |
| 401 | Missing, invalid or expired token, or wrong email or password |
| 403 | Not your profile or not your post |
| 404 | Not found |
| 409 | Email already in use |

## MongoDB Compass queries (W2D1)

The queries and the number of results are in [queries/W2D1.md](queries/W2D1.md).
