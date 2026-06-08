import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
// running this file first run pnpm i pg and pnpm i -D @types/pg   because it is a third party library and we need to install its types for TypeScript to work properly.
function create_db_connection() :pg.Client {
    const db= new pg.Client({
    user:'postgres',
    host:'localhost',
    database:'enterprise_website',
    password:process.env.db_password,
    port:5432
});
    return db;
}

export default create_db_connection;
