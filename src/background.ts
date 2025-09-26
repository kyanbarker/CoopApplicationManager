// listen for when the tab changes to a job details page and insert the content script into the dom
// the content script will listen for a message from the popup to scrape the data
// the content script will then send a message to this backgroudn script
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.url.includes("/students/app/jobs/detail/")) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      files: ["dist/content.js"],
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "addJobDetailsToNotion":
      addJobDetailsToNotion(message.jobDetails);
      break;
    default:
      throw new Error("Unknown action: " + message.action);
  }
});

function getRequestBody(jobDetails: JobApplicationDetails) {
  const DATABASE_ID = process.env.DATABASE_ID;
  function getRichTextProperty(value: string) {
    return {
      rich_text: [
        {
          type: "text",
          text: {
            content: value,
          },
        },
      ],
    };
  }
  const properties: any = {
    title: {
      title: [
        {
          type: "text",
          text: {
            content: jobDetails.title,
            link: {
              url: jobDetails.url,
            },
          },
        },
      ],
    },
  };
  // Only include properties with values - Notion API rejects undefined/null properties
  if (jobDetails.status) {
    properties.status = {
      select: {
        name: jobDetails.status,
      },
    };
  }
  if (jobDetails.notes) {
    properties.notes = getRichTextProperty(jobDetails.notes);
  }
  if (jobDetails.company) {
    properties.company = getRichTextProperty(jobDetails.company);
  }
  // Check for undefined (not falsey) to allow 0 as a valid pay value
  if (jobDetails.pay_per_hour !== undefined) {
    properties.pay_per_hour = {
      number: jobDetails.pay_per_hour,
    };
  }
  if (jobDetails.type) {
    properties.type = getRichTextProperty(jobDetails.type);
  }
  if (jobDetails.deadline) {
    properties.deadline = {
      date: {
        start: jobDetails.deadline,
      },
    };
  }
  if (jobDetails.location) {
    properties.location = getRichTextProperty(jobDetails.location);
  }
  return {
    parent: { database_id: DATABASE_ID },
    properties,
  };
}

async function addJobDetailsToNotion(jobDetails: JobApplicationDetails) {
  const NOTION_API_URL = "https://api.notion.com/v1/pages";
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const requestBody = getRequestBody(jobDetails);
  try {
    const response = await fetch(NOTION_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      const error = await response.json();
      console.error("Failed to add row:", error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
