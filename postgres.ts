import { Client } from "pg";
import { searchString } from "./index.ts";

const client = new Client({
  connectionString: "postgres://postgres:postgres@demo.xmentium.com:5432/xm",
});

export async function searchPostgres() {
  try {
    // Connect to the PostgreSQL database
    await client.connect();
    console.log("Connected to PostgreSQL");

    // Retrieve all tables in the public schema
    const tablesResult = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);

    const tables = tablesResult.rows;

    // Iterate over each table
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`Table: ${tableName}`);

      // Retrieve all columns for the current table
      const columnsResult = await client.query(
        `
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = $1
            `,
        [tableName]
      );

      const columns = columnsResult.rows.map((row) => row.column_name);

      // Retrieve all rows for the current table
      const rowsResult = await client.query(`SELECT * FROM ${tableName}`);
      const rows = rowsResult.rows;

      for (const row of rows) {
        for (const column of columns) {
          const value = JSON.stringify(row[column]).toLocaleLowerCase();
          if (value && value.includes(searchString.toLocaleLowerCase())) {
            console.error(
              `Found a match in table: ${tableName}, column: ${column}, row:`,
              row.id
            );
          }
        }
      }
    }
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error);
  } finally {
    // Close the connection
    await client.end();
    console.log("Connection closed");
  }
}
