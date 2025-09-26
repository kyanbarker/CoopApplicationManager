# Co-op Application Manager

A Chrome extension that automates the process of adding job application details from NUWorks (Northeastern University's job portal) into a Notion database. This extension dramatically reduces the time spent manually entering job information by automatically web scraping job details and allowing you to submit them with a single click.

## How It Works

This extension consists of three main components working together:

- **Background Script**: Runs in the background of your browser and monitors URL changes. When you navigate to a NUWorks job details page, it automatically injects the content script. It also handles uploading job details to your Notion database.

- **Content Script**: Scrapes job information from the NUWorks job details page and assembles it into a structured object. This script is automatically injected when you visit job pages.

- **Popup Script**: Displays a form with the scraped job details, allowing you to review and modify the information before submitting it to Notion.

The extension works seamlessly with NUWorks' single-page application architecture, automatically detecting when you navigate to job detail pages and pre-filling forms with scraped data.

## Prerequisites

- A Notion account
- Node.js and npm installed
- Chrome browser

## Setup Instructions

### 1. Notion Database Setup

Create a new Notion database with the following properties (exact names and types):

| Property Name | Type | Notes |
|---------------|------|-------|
| `title` | Title | Will include a link to the job posting |
| `status` | Select | For tracking application status |
| `notes` | Rich Text | Additional notes about the position |
| `company` | Rich Text | Company name |
| `pay_per_hour` | Number | Hourly wage |
| `type` | Rich Text | Job type (defaults to "Co-op") |
| `deadline` | Date | Application deadline |
| `location` | Rich Text | Job location |

**Important**: For the `status` property, create the following select options in your Notion database:
- `Not applied` (this should be the default)
- `Applied`
- `Rejected`
- `Accepted`

### 2. Notion Integration Setup

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name (e.g., "Co-op Application Manager")
4. Select the workspace containing your database
5. Click "Submit"
6. Copy the "Internal Integration Token" - this is your `NOTION_TOKEN`

### 3. Get Your Database ID

1. Open your Notion database in a web browser
2. Copy the URL - it will look like: `https://www.notion.so/your-workspace/DATABASE_ID?v=...`
3. Extract the `DATABASE_ID` from the URL (the long string of letters and numbers)

### 4. Share Database with Integration

1. In your Notion database, click the "Share" button
2. Search for your integration name
3. Click "Invite" to give the integration access

### 5. Environment Configuration

1. Create a `.env` file in the project root
2. Add your credentials:
```env
NOTION_TOKEN=your_integration_token_here
DATABASE_ID=your_database_id_here
```

### 6. Verify Database Schema

Run the schema verification script to ensure your database matches the expected structure:

```bash
node getDatabaseSchema.js
```

This will output your database schema. Compare it with the expected structure above.

### 7. Build the Extension

Install dependencies and build the extension:

```bash
npm install
npm run build
```

This creates the `dist/` folder with compiled JavaScript files that Chrome can use.

### 8. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the entire project folder (not just the `dist/` folder)
5. The extension should now appear in your extensions list

## Usage

1. Navigate to a job details page on NUWorks (`/students/app/jobs/detail/`)
2. Click the extension icon in your Chrome toolbar
3. Review the automatically populated form fields
4. Make any necessary edits
5. Click "Submit" to add the job to your Notion database

Most of the time, you'll only need to click submit since the data is automatically scraped and populated!

## Limitations

- **NUWorks Specific**: Automatic web scraping only works on NUWorks job detail pages. The extension can still be used on other job sites, but you'll need to manually enter the data.
- **Page Structure Dependency**: If NUWorks changes their page structure, the web scraping functionality may break until the selectors are updated.
- **Rate Limits**: The Notion API allows an average of 3 requests per second. For typical usage, this shouldn't be an issue.

## Troubleshooting

- **Extension not working**: Make sure you've built the project with `npm run build` and loaded the entire project folder (not just `dist/`) in Chrome
- **Data not uploading**: Verify your `.env` file has the correct `NOTION_TOKEN` and `DATABASE_ID`, and that you've shared your database with the integration
- **Schema errors**: Run `getDatabaseSchema.js` to verify your database structure matches the expected schema

## Customization

If you want to modify the extension for different job sites or database schemas:

1. Update the URL pattern in `background.ts`
2. Modify the DOM selectors in `content.ts` for the new site
3. Adjust the `getRequestBody` function in `background.ts` to match your database schema
4. Rebuild with `npm run build`

## Tech Stack

- **TypeScript** - Type-safe JavaScript for extension development
- **Chrome Extensions API** - Browser integration and cross-script communication
- **Notion API** - Database integration for storing job application data
- **Webpack** - Module bundling and build process
- **Web Scraping** - DOM manipulation for automated data extraction

## Contributing

Feel free to submit issues or pull requests to improve the extension!