## Database Setup

To set up the database locally, ensure you have MariaDB installed and running. You can import the database schema using the provided `schema.sql` file.

Run the following command in your terminal:

```bash
mariadb -u root -p < schema.sql
```

Enter your MariaDB root password when prompted. This will execute the SQL commands in the file to create the necessary database structure.

## Environment Configuration

This project requires environment variables to connect to the database and configure other settings. You need to create a `.env` file in the root directory of the project.

### Creating the `.env` file

1. Create a new file named `.env` in the project root.
2. Copy the following template into the file and fill in your specific values:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your root password
DB_NAME=finnamie
PORT=3000
JWT_SECRET=your secret
```

## Running the Backend

To start the backend server in development mode (with watch mode enabled), run the following command:

```bash
npm run dev
```
