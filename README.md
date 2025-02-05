# WhereIsIt

This is a Node.js Express server that integrates several npm packages such as Express, MongoDB, Cookie-Parser, CORS, dotenv, JWT (JSON Web Token) Authentication. This one serves the client side of `WhereIsIt`.

## Features

- **Express.js**: Web framework for building the server
- **MongoDB**: Database for storing user data and other information
- **JWT Authentication**: Secure user authentication with JSON Web Tokens
- **Cookie-Parser**: Parsing cookies in requests
- **CORS**: Enabling cross-origin requests for the server
- **dotenv**: Environment variable management

## Prerequisites

Make sure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/)
- A **MongoDB** instance (either local or cloud-based like MongoDB Atlas)

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone git@github.com:sakib-333/whereisit-server.git

   cd ph-b10-a11-server
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file root of the folder and all of your secret keys.

   ```bash
   DB_USERNAME=<your-db-username>

   DB_PASSWORD=<your-db-password>

   JWT_SECRET=<your-jwt-secret>

   ```

4. Start server

   ```bash
   node index.js
   ```

5. Your server should now be running on `http://localhost:3000`.
