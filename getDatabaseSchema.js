require("dotenv").config();

const NOTION_API_URL = "https://api.notion.com/v1/databases/";
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;

async function getDatabaseSchema() {
  console.assert(NOTION_TOKEN);
  console.assert(DATABASE_ID);

  const response = await fetch(`${NOTION_API_URL}${DATABASE_ID}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
    },
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Database Schema:", data);
    return data;
  } else {
    const error = await response.json();
    console.error("Failed to retrieve database schema:", error);
  }
}

getDatabaseSchema();
