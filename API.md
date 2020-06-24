# Organizable API

Welcome to Organizable-API. The back-end solution for your Organizable App 😎

## Instructions

- Clone this repo on your local machine.
- Run `bundle install`
- Setup your datababase:
  - `rails db:create`
  - `rails db:migrate`
  - `rails db:seed`
- Start the server `rails s`

## About the API

### Endpoints

Here the list of available endpoints. The most important are marked with (\*)

Manage users:

- POST /users
- GET /users/:id
- PATCH /users/:id
- PUT /users/:id
- DELETE /users/:id

Manage authentication:

- POST /login \* This endpoint return your authentication token (required for everything else 👀)
- POST /logout

Manage boards:

- GET /boards \* This endpoint return all the data needed to manage the actions on the Main page.
- POST /boards
- GET /boards/:id \* This endpoint return all the data needed to manage the actions on the Board page.
- PATCH /boards/:id
- PUT /boards/:id
- DELETE /boards/:id

Manage lists:

- POST /boards/:board_id/lists
- PATCH /boards/:board_id/lists/:id
- PUT /boards/:board_id/lists/:id
- DELETE /boards/:board_id/lists/:id

Manage labels:

- POST /boards/:board_id/labels
- PATCH /boards/:board_id/labels/:id
- PUT /boards/:board_id/labels/:id
- DELETE /boards/:board_id/labels/:id

Manage cards:

- POST /lists/:list_id/cards
- GET /lists/:list_id/cards/:id \* This endpoint return additional data about checklist and check_items
- PATCH /lists/:list_id/cards/:id
- PUT /lists/:list_id/cards/:id
- DELETE /lists/:list_id/cards/:id

Manage checklists:

- POST /cards/:card_id/checklists
- PATCH /cards/:card_id/checklists/:id
- PUT /cards/:card_id/checklists/:id
- DELETE /cards/:card_id/checklists/:id

Manage check items:

- POST /checklists/:checklist_id/check_items
- PATCH /checklists/:checklist_id/check_items/:id
- PUT /checklists/:checklist_id/check_items/:id
- DELETE /checklists/:checklist_id/check_items/:id

Manage Card-Label relationship:

- POST /cards/:card_id/cards_labels
- DELETE /cards/:card_id/cards_labels

### API Authentication

This API uses HTTP Authentication Token. Make a POST request to `/login` with the `username` and
`password` of the test user created through the seed file:

```json
{
  "username": "codeable",
  "password": "123456"
}
```

Since the username and password are valid, the server will return the authorization token:

```json
{
  "token": "bkzrchZ9GhguMygevZ4n1oHm"
}
```

This token should be included on the `headers` for almost all the other endpoints, otherwise you will get an `access denied` error.

To include the token on your headers, add a `key`-`value` pair in this way:

- `key`: Authorization
- `value`: Token token="`bkzrchZ9GhguMygevZ4n1oHm`"

Example with Insomnia:

![](https://p-vvf5mjm.t2.n0.cdn.getcloudapp.com/items/12uN4kAm/Image%202020-06-24%20at%209.47.35%20AM.png?v=9d988d1fea50cb65e588bea5a9d365da)

You can include headers using `fetch`, check the documentation 😎