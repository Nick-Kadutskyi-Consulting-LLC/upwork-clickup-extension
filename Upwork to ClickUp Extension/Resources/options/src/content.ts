import * as Scrapper from "./scrapper";
import type { JobPosting } from "@/types";
import debounce from "debounce";
import { labelSavedJobs } from "@/utils";

chrome.runtime.sendMessage({ action: "DISABLE_ACTION_ON_START" }).then();

chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: Function) => {
  switch (request?.action) {
    case "PARSE_JOB_POSTING":
      const jobPosting = parseJobPosting();
      sendResponse({ jobPosting });
      break;
    case "RESET_ALL_ICONS":
      chrome.runtime.sendMessage({ action: "RESET_ICON", data: { location: document.location } });
      break;
    case "OPEN_URL_IN_NEW_TAB":
      window.open(request?.data?.url, "_blank");
      break;
    default:
      console.error(
        request?.action === undefined
          ? "No action provided"
          : "No such action " + request?.action
      );
  }
});

const parseJobPosting = () => {
  const jobPosting: JobPosting = {
    "Job Name": Scrapper.getTitle() || "",
    "Job Description": Scrapper.getDescription(),
    "Payment Verified": Scrapper.getPaymentVerificationStatus(),
    "Job Unique ID": Scrapper.getJobUniqueId() || "",
    "Job URL": Scrapper.getJobUrl(),
    "Job Country": Scrapper.getCountry(),
    "Job City": Scrapper.getCity(),
    "Job Type": Scrapper.getJobType(),
    "Date Posted": Scrapper.getDatePosted() || Date.now(),
    "Budget": Scrapper.getBudget(),
    "Total Spent": Scrapper.getTotalSpent()
  };
  return jobPosting;
};

const jobsContainer = document.querySelector("[data-test=\"job-tile-list\"]");

const sendLocationChanged = () => {
  return chrome.runtime.sendMessage({
    action: "LOCATION_CHANGED",
    data: { location: document.location }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (jobsContainer?.querySelectorAll("section")) {
      labelSavedJobs(jobsContainer?.querySelectorAll("section"));
    }
  }, 1500);
});

const onLocationChanged = () => {
  if (jobsContainer?.querySelectorAll("section")) {
    labelSavedJobs(jobsContainer?.querySelectorAll("section"));
  }
  setTimeout(() => {
    sendLocationChanged();
  }, 1000);
};

const onJobsLoaded = debounce(() => {
  if (jobsContainer?.querySelectorAll("section")) {
    labelSavedJobs(jobsContainer?.querySelectorAll("section"));
  }
}, 1000);

let oldHref = document.location.href;
let oldJobListLength = jobsContainer?.querySelectorAll("section")?.length;

window.onload = function() {
  if (jobsContainer?.querySelectorAll("section")) {
    labelSavedJobs(jobsContainer?.querySelectorAll("section"));
  }
  sendLocationChanged();

  let bodyList = document.querySelector("body") as Node;

  let observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (oldHref != document.location.href) {
        oldHref = document.location.href;
        onLocationChanged();
      }
      if (oldJobListLength !== jobsContainer?.querySelectorAll("section")?.length) {
        oldJobListLength = jobsContainer?.querySelectorAll("section")?.length;
        onJobsLoaded();
      }
    });
  });

  let config = {
    childList: true,
    subtree: true
  };

  observer.observe(bodyList, config);
};


export default {};