import * as Scrapper from "./scrapper"
import type {JobPosting} from "@/types";
/* global browser */
browser.runtime.sendMessage({greeting: "hello"}).then((response: Response) => {
    console.log("Received response: ", response);

});

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
    console.log('PARSED JOB', jobPosting)
    return jobPosting
}

export default {}