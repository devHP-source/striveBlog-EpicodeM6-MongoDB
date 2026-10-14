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

## Test the API with Bruno

Bruno must call the **backend** (`http://localhost:9099`), not the frontend on port 3000.

1. Create a new collection (e.g. "Strive Blog").
2. Optional: go to **Environments → Configure → Create**, add the variable `baseUrl` = `http://localhost:9099` and select the environment in the top-right dropdown.
3. Create a request, choose the method, write the URL and press **Send** (Ctrl+Enter).
4. For `POST` and `PUT` open the **Body** tab and choose **JSON**.

Quick check: `GET {{baseUrl}}/` should return `{ "message": "Welcome to Epi-StriveBlog" }`.

### Authors

| Method | URL | Description |
|---|---|---|
| GET | `{{baseUrl}}/authors?page=1&perPage=10` | List of authors (paginated, alphabetical) |
| GET | `{{baseUrl}}/authors/:id` | One author |
| GET | `{{baseUrl}}/authors/:id/blogPosts` | All the posts of one author |
| POST | `{{baseUrl}}/authors` | Create an author |
| PUT | `{{baseUrl}}/authors/:id` | Update an author (a new email is also updated in their posts) |
| DELETE | `{{baseUrl}}/authors/:id` | Delete an author and all their posts |

Example body for `POST /authors`:
```json
{
  "name": "Mario",
  "surname": "Rossi",
  "email": "mario@example.com",
  "dob": "1990-01-01",
  "avatar": "https://ui-avatars.com/api/?name=Mario+Rossi"
}
```

### Blog posts

| Method | URL | Description |
|---|---|---|
| GET | `{{baseUrl}}/blogPosts?page=1&perPage=10&title=react` | List of posts (paginated, newest first, optional search by title) |
| GET | `{{baseUrl}}/blogPosts/:id` | One post |
| POST | `{{baseUrl}}/blogPosts` | Create a post (the author email must belong to an existing author) |
| PUT | `{{baseUrl}}/blogPosts/:id` | Update a post |
| DELETE | `{{baseUrl}}/blogPosts/:id` | Delete a post |

Example body for `POST /blogPosts`:
```json
{
  "category": "Tech",
  "title": "My first post",
  "cover": "https://picsum.photos/600/300",
  "readTime": { "value": 5, "unit": "minute" },
  "author": "mario@example.com",
  "content": "<p>Hello world</p>"
}
```

### Notes

- Create an author first. Then use the `_id` from the response in the `/:id` routes.
- The `author` field of a post is the author's **email**, which is how `GET /authors/:id/blogPosts` finds the posts.
- `perPage` goes from 1 to 100 (default 10).
- `PUT` accepts only the fields you want to change.
- Response codes:

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Missing required field, invalid ID or no author with that email |
| 404 | Not found |
| 409 | Email already in use |

## MongoDB Compass queries (W2D1)

The queries and the number of results are in [queries/W2D1.md](queries/W2D1.md).
