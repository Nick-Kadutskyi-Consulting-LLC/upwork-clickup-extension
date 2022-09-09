/* global browser */
import {storageGet, storageSet} from "@/localStorage";
import type {ClickUpCustomField, ClickUpTask, JobPosting, LocalStore} from "@/types";
import {prepClickUpBody} from "@/clickUpTaskBody";

browser.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
    console.log("Received request: ", request);

    if (request.greeting === "hello") sendResponse({farewell: "goodbye"});
});

let state = {}

browser.browserAction.onClicked.addListener(function (tab: any) {
    browser.tabs.sendMessage(tab.id, {action: "PARSE_JOB_POSTING"}, (response: any) => {
        storageGet().then((stored: any) => {
            const apiKey = stored?.clickUpApiToken
            const list = stored?.clickUpListToSaveJobs
            if (list) {
                storageGet().then((stored: LocalStore) => {
                    fetch(`https://api.clickup.com/api/v2/list/${list?.id}/task`, {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            Authorization: apiKey
                        },
                        body: JSON.stringify(prepClickUpBody(response.jobPosting, stored.taskFieldMarkup))
                    })
                        .then(r => r?.json())
                        .then(task => {
                            if (!Array.isArray(stored?.upworkJobsSentToClickUp)) {
                                stored.upworkJobsSentToClickUp = []
                            }
                            stored.upworkJobsSentToClickUp.push({
                                task_id: task?.id,
                                task_title: task?.name,
                                task_url: task?.url,
                                job_id: response.jobPosting["Job Unique ID"],
                                job_title: response.jobPosting["Job Name"],
                                job_date_posted: response.jobPosting["Date Posted"]
                            })
                            storageSet(stored)
                        })
                        .catch((e: any) => {
                            console.error('Error during sending job to ClickUp', e)
                        })
                }, (e: Error) => {
                    console.error(e)
                })
            } else {
                // todo show error that list is not selected
                console.error('List to save jobs is not selected')
            }
        }, (e: Error) => {
            console.error(e)
        })

    });
});

export default {}