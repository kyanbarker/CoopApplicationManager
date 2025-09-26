const form: Element = document.getElementById("jobDetailsForm")!;
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url: string = (await getActiveTab()).url!;
  const payPerHourString: string = getInputElementValue("payPerHour");
  const payPerHour: number | undefined = payPerHourString
    ? Number(payPerHourString)
    : undefined;

  const jobDetails: JobApplicationDetails = {
    title: getInputElementValue("title"),
    company: getInputElementValue("company"),
    location: getInputElementValue("location"),
    deadline: getInputElementValue("deadline"),
    status: getInputElementValue("status"),
    type: getInputElementValue("type") || "Co-op",
    pay_per_hour: payPerHour,
    notes: getInputElementValue("notes"),
    url: url,
  };
  chrome.runtime.sendMessage({
    action: "addJobDetailsToNotion",
    jobDetails: jobDetails,
  });
});

// returns the active tab in the browser
async function getActiveTab(): Promise<chrome.tabs.Tab> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  console.assert(tabs.length == 1);
  return tabs[0];
}

async function getJobDetailsFromContentScript(): Promise<JobDetails> {
  const activeTab = await getActiveTab();
  console.assert(!!activeTab);
  const jobDetails = await chrome.tabs.sendMessage(activeTab.id!, {
    action: "getJobDetails",
  });
  return jobDetails;
}

async function setFormValues() {
  const activeTab = await getActiveTab();
  console.assert(!!activeTab);
  if (activeTab.url!.includes("/students/app/jobs/detail/")) {
    const jobDetails = await getJobDetailsFromContentScript();
    setInputElementValue("title", jobDetails.title);
    setInputElementValue("company", jobDetails.company);
    setInputElementValue("location", jobDetails.location);
    setInputElementValue("type", jobDetails.type);

    const deadline = jobDetails.deadline; // e.g. 2024-12-30T05:00:00.000Z
    if (!deadline) return;
    const formattedDeadline = deadline.split("T")[0];
    setInputElementValue("deadline", formattedDeadline);
  }
}

function getInputElement(inputElementId: string): HTMLInputElement {
  return document.querySelector(`#${inputElementId}`)!;
}

function getInputElementValue(inputElementId: string): string {
  return getInputElement(inputElementId).value;
}

function setInputElementValue(inputElementId: string, value: string) {
  getInputElement(inputElementId).value = value;
}

setFormValues();
