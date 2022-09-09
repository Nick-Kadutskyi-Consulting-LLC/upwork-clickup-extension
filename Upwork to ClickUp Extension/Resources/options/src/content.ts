import * as Scrapper from "./scrapper"
import type {JobPosting, LocalStore} from "@/types";
import debounce from "debounce";
import {storageGet} from "@/localStorage";
import {labelSavedJobs} from "@/utils";
/* global browser */
// browser.runtime.sendMessage({greeting: "hello"}).then((response: Response) => {
//     console.log("Received response: ", response);
// });

browser.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
    console.log("Received request: ", request);
    if (request.action === 'PARSE_JOB_POSTING') {
        const jobPosting = parseJobPosting()
        sendResponse({jobPosting});
    }
});

// document.body.style.border = "5px solid red";

const parseJobPosting = () => {
    const jobPosting: JobPosting = {
        "Job Name": Scrapper.getTitle(),
        "Job Description": Scrapper.getDescription(),
        "Payment Verified": Scrapper.getPaymentVerificationStatus(),
        "Job Unique ID": Scrapper.getJobUniqueId(),
        "Job URL": Scrapper.getJobUrl(),
        "Job Country": Scrapper.getCountry(),
        "Job City": Scrapper.getCity(),
        "Job Type": Scrapper.getJobType(),
        "Date Posted": Scrapper.getDatePosted(),
        "Budget": Scrapper.getBudget(),
        "Total Spent": Scrapper.getTotalSpent()
    }
    return jobPosting
}

const jobsContainer = document.querySelector('[data-test="job-tile-list"]')

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (jobsContainer?.querySelectorAll('section')) {
            labelSavedJobs(jobsContainer?.querySelectorAll('section'))
        }
    }, 1500)
});

const onLocationChanged = () => {
    if (jobsContainer?.querySelectorAll('section')) {
        labelSavedJobs(jobsContainer?.querySelectorAll('section'))
    }
}

const onJobsLoaded = debounce(() => {
    if (jobsContainer?.querySelectorAll('section')) {
        labelSavedJobs(jobsContainer?.querySelectorAll('section'))
    }
}, 1000)

let oldHref = document.location.href;
let oldJobListLength = jobsContainer?.querySelectorAll('section')?.length

window.onload = function () {
    if (jobsContainer?.querySelectorAll('section')) {
        labelSavedJobs(jobsContainer?.querySelectorAll('section'))
    }

    let bodyList = document.querySelector("body") as Node

    let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (oldHref != document.location.href) {
                oldHref = document.location.href;
                onLocationChanged()
            }
            if (oldJobListLength !== jobsContainer?.querySelectorAll('section')?.length) {
                oldJobListLength = jobsContainer?.querySelectorAll('section')?.length
                onJobsLoaded()
            }
        });
    });

    let config = {
        childList: true,
        subtree: true
    };

    observer.observe(bodyList, config);
};


export default {}