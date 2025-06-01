"use strict";
console.log("popup.js is running");
const form = document.getElementById("jobDetailsForm");
form.addEventListener("submit", async (event) => {
    console.log("form submitted");
    event.preventDefault();
    const url = (await getActiveTab()).url;
    const payPerHourString = getInputElementValue("payPerHour");
    const payPerHour = payPerHourString
        ? Number(payPerHourString)
        : undefined;
    const jobDetails = {
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
    console.log(jobDetails);
    chrome.runtime.sendMessage({
        action: "addJobDetailsToNotion",
        jobDetails: jobDetails,
    });
});
// returns the active tab in the browser
async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    console.assert(tabs.length == 1);
    return tabs[0];
}
// sends a message to the content script
// deprecated because we are now using the form instead of the button
async function onClick() {
    console.log("button clicked");
    const activeTab = await getActiveTab();
    console.assert(!!activeTab);
    chrome.tabs.sendMessage(activeTab.id, {
        action: "scrapeAndAddJobDetailsToSupabase",
    });
}
async function getJobDetailsFromContentScript() {
    console.log("getting job details");
    const activeTab = await getActiveTab();
    console.assert(!!activeTab);
    const jobDetails = await chrome.tabs.sendMessage(activeTab.id, {
        action: "getJobDetails",
    });
    return jobDetails;
}
async function setFormValues() {
    console.log("setting form values");
    const activeTab = await getActiveTab();
    console.assert(!!activeTab);
    if (activeTab.url.includes("/students/app/jobs/detail/")) {
        const jobDetails = await getJobDetailsFromContentScript();
        console.log(jobDetails);
        setInputElementValue("title", jobDetails.title);
        setInputElementValue("company", jobDetails.company);
        setInputElementValue("location", jobDetails.location);
        setInputElementValue("type", jobDetails.type);
        const deadline = jobDetails.deadline; // e.g. 2024-12-30T05:00:00.000Z
        if (!deadline)
            return;
        console.log("deadline:", deadline);
        const formattedDeadline = deadline.split("T")[0];
        setInputElementValue("deadline", formattedDeadline);
    }
}
function getInputElement(inputElementId) {
    return document.querySelector(`#${inputElementId}`);
}
function getInputElementValue(inputElementId) {
    return getInputElement(inputElementId).value;
}
function setInputElementValue(inputElementId, value) {
    getInputElement(inputElementId).value = value;
}
setFormValues();
