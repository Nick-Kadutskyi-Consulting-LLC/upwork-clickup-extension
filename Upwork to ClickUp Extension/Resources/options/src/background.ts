/* global browser */
import {storageGet} from "@/localStorage";
import type {ClickUpCustomField, ClickUpTask, JobPosting} from "@/types";
import {prepClickUpBody} from "@/clickUpTaskBody";

browser.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
    console.log("Received request: ", request);

    if (request.greeting === "hello") sendResponse({farewell: "goodbye"});
});

let state = {}

browser.browserAction.onClicked.addListener(function (tab: any) {
    browser.tabs.sendMessage(tab.id, {action: "PARSE_JOB_POSTING"}, (response: any) => {
        console.log('responded tutt111', response)
        // todo send to ClickUp
        storageGet().then((stored: any) => {
            const apiKey = stored.clickUpApiToken
            const list = stored.clickUpListToSaveJobs
            storageGet().then((stored: any) => {
                fetch(`https://api.clickup.com/api/v2/list/${list.id}/task`, {
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
                        console.log('task', task)
                    })
            }, (e: Error) => {
                console.error(e)
            })
        }, (e: Error) => {
            console.error(e)
        })

    });
});

export default {}