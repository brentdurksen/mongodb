import { MongoClient } from "mongodb";
import { searchPostgres } from "./postgres.ts";

export const searchString = "staticblitz";
searchMongo().catch(console.error);
searchPostgres().catch(console.error);

async function searchMongo() {
  const uri = "mongodb://localhost:27017";
  const dbName = "xm";
  const client = new MongoClient(uri);
  console.log("Connecting to MongoDB...");
  await client.connect();
  const database = client.db(dbName);
  const collections = await database.collections();

  for (const collection of collections) {
    console.log(collection.collectionName);
    const documents = await collection.find().toArray();
    for (const document of documents) {
      const stringified = JSON.stringify(document, null, 2).toLocaleLowerCase();
      if (stringified.includes(searchString.toLocaleLowerCase())) {
        console.error(
          "Found a match in collection:",
          collection.collectionName,
          "document:",
          document._id
        );
      }
    }
  }

  console.log("Disconnecting from MongoDB...");
  await client.close();
}
