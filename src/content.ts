// There are two ways this script can run: as a content script, or as a script executed by background.js
//
// This script runs as a content script when a job details page is freshly loaded/reloaded.
// If we have "run_at": "document_idle" or "document_end" in our manifest.json
// this script will run as a content script after the DOM is fully loaded.
// If we have "run_at": "document_start" in our manifest.json
// this script will run as a content script before the DOM is fully loaded.
//
// This script runs as a script executed by background.js when the url changes to a job details page.
// Changing the url to a job details page does not cause the page to reload
// because NUWorks is an SPA (single page application).

console.log("content.js is running");

// We don't want add a message listener more than once.
// If we add a message listener more than once, we will add data to supabase more than once
// each time we send the scrapeAndAddJobDetailsToSupabase message from the popup.
// We want to add data to supabase only once each time we send the scrapeAndAddJobDetailsToSupabase message from the popup.
// Thus, we don't want add a message listener more than once.
// We set an attribute in the document body to indicate whether this script has been executed.
// If this script has been executed before, we don't want to add the listener again.

// Note: assigning `document.body.hasAttribute("has-script-been-executed")`
// to a variable causes errors. I don't know why, so I just don't assign it to a variable.
if (!document.body.hasAttribute("has-script-been-executed")) {
  // Set an attribute in a document body to indicate that this script has been executed
  // so that we don't execute it again later.
  document.body.setAttribute("has-script-been-executed", "true");
  console.log("Content script running for the first time.");
  addListener();
}

function addListener() {
  // Listen for messages from popup.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("message received", message);

    // Unfortunately, we cannot export/import valid values for message.action
    // because content.js is a script and not a module.
    //
    // See notes.md
    switch (message.action) {
      case "scrapeAndAddJobDetailsToSupabase":
        scrapeAndAddJobDetailsToSupabase();
        break;
      case "getJobDetails":
        sendResponse(scrapeJobDetails());
        break;
      default:
        break;
    }
  });
}

// deprecated
function scrapeAndAddJobDetailsToSupabase() {
  console.log("scraping data");

  const jobDetails = scrapeJobDetails();
  console.log("jobDetails:", jobDetails);
  console.log("adding job details to supabase");
  chrome.runtime.sendMessage({
    action: "addJobDetailsToSupabase",
    jobDetails: jobDetails,
  });
}

function scrapeJobDetails() {
  console.log("getting job details");

  return {
    title: getTitle(),
    company: getCompany(),
    location: getLocation(),
    type: getType(),
    deadline: getDeadline(),
    url: document.URL,
  };
}

function getTitle(): string {
  return getTitleElement().textContent!.trim();
}

function getTitleElement(): Element {
  return document.querySelector("a.job-title.ng-star-inserted")!;
}

function getCompany(): string {
  return getCompanyElement().textContent!.trim();
}

function getCompanyElement(): Element {
  return document.querySelector("a.text-base.font-size-base")!;
}

function getLocation(): string {
  return getLocationElement().textContent!.trim();
}

function getLocationElement(): Element {
  return document.querySelector(
    'span.body-small[ng-reflect-ng-class="body-small"]'
  )!;
}

function getType(): string {
  return getTypeElement().textContent!.trim();
}

function getTypeElement(): Element {
  return document.querySelector(
    'span.body-small[ng-reflect-ng-class="body-small text-truncate block"]'
  )!;
}

function getDescription(): string {
  return getDescriptionElement().textContent!.trim();
}

function getDescriptionElement(): Element {
  return document.querySelector(
    "div.text-overflow.space-top-lg.text-gray.p-group.field-widget-tinymce"
  )!;
}

function getDeadline(): Date | null {
  const deadlineElement: Element | null = getDeadlineElement();
  if (!deadlineElement) return null;
  const deadlineString: string = deadlineElement.textContent!;
  return new Date(deadlineString);
}

function getDeadlineElement(): Element | null {
  return document.querySelector("p[id=sy_formfield_job_deadline]")!;
}

function getAdditionalDetails(): { name: string; value: string }[] {
  const containers: Element[] = getAdditionalDetailsContainers();
  return containers.map((container) => {
    return {
      name: getAdditionalDetailName(container),
      value: getAdditionalDetailValue(container),
    };
  });
}

function getAdditionalDetailsContainers(): Element[] {
  const containers = document.querySelectorAll(".form-static-list");
  return Array.from(containers);
}

function getAdditionalDetailName(container: Element): string {
  return getAdditionalDetailNameElement(container).textContent!.trim();
}

function getAdditionalDetailNameElement(container: Element): Element {
  return container.querySelector(
    ".field-label.field-label-readonly.ng-star-inserted"
  )!;
}

function getAdditionalDetailValue(container: Element): string {
  return getAdditionalDetailValueElement(container).textContent!.trim();
}

function getAdditionalDetailValueElement(container: Element): Element {
  return container.querySelector(
    ".field-widget.widget-readonly.field-widget-text"
  )!;
}
