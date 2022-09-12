import {storageGet, storageSet} from "@/localStorage";
import type {LocalStore} from "@/types";
import {prepClickUpBody} from "@/clickUpTaskBody";
import {isJobSaved, resetAllIcons, setIcon} from "@/utils";
import type {Runtime, Tabs} from "webextension-polyfill";
import {getJobUniqueId} from "@/scrapper";

browser.contextMenus.create({
    id: "go-to-preferences",
    title: "Preferences",
    contexts: ['browser_action'],
})
browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "go-to-preferences":
            console.log(info.selectionText);
            browser.runtime.openOptionsPage().then()
            break;
        default:
    }
})

browser.runtime.onMessage.addListener((request: any, sender: Runtime.MessageSender) => {

    return new Promise((resolve, reject) => {
        switch (request?.action) {
            case "LOCATION_CHANGED":
            case "RESET_ICON":
                if (sender?.tab?.id !== undefined && sender?.tab?.windowId != undefined) {
                    setIcon(sender.tab.id, sender.tab.windowId, request.data.location.href)
                        .then(() => {
                            resolve(true)
                        })
                }
                break
            case "DISABLE_ACTION_ON_START":
                if (sender?.tab?.id !== undefined && sender?.tab?.windowId != undefined) {
                    Promise
                        .all([
                            browser.browserAction.setIcon({
                                path: '/images/disabled-48x48@1x.png',
                                tabId: sender?.tab?.id,
                                windowId: sender?.tab?.windowId
                            }),
                            browser.browserAction.disable(sender?.tab?.id)
                        ])
                        .then(() => {
                            console.log('disabled action icon')
                            resolve(true)
                        })
                }
                break
            default:
                reject(
                    request?.action === undefined
                        ? "No action provided"
                        : "No such action: " + request?.action
                )
        }
    })
});

let state = {}

browser.browserAction.onClicked.addListener(function (tab: Tabs.Tab) {
    const uniqueId = getJobUniqueId(tab.url)
    if (uniqueId) {
        isJobSaved(uniqueId).then((savedJob) => {
            if (savedJob) {
                window.open(savedJob.task_url, '_blank')
            } else {
                if (tab.id !== undefined) {
                    browser.tabs
                        .sendMessage(tab.id, {action: "PARSE_JOB_POSTING"})
                        .then((response: any) => {
                            storageGet().then((stored: LocalStore) => {
                                const apiKey = stored?.clickUpApiToken
                                const list = stored?.clickUpListToSaveJobs
                                if (list && apiKey) {
                                    browser.browserAction.disable(tab.id).then()
                                    browser.browserAction.setIcon({
                                        tabId: tab.id,
                                        path: '/images/loading-48x48@1x.png'
                                    }).then()
                                    fetch(`https://api.clickup.com/api/v2/list/${list?.id}/task`, {
                                        method: 'POST',
                                        credentials: 'same-origin',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Accept: 'application/json',
                                            'X-Requested-With': 'XMLHttpRequest',
                                            Authorization: apiKey
                                        },
                                        body: JSON.stringify(prepClickUpBody(response.jobPosting, stored?.taskFieldMarkup))
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
                                            storageSet(stored)?.then(() => {
                                                resetAllIcons()
                                            })
                                        })
                                        .catch((e: any) => {
                                            console.error('Error during sending job to ClickUp', e)
                                        })
                                } else {
                                    // todo show error that list is not selected
                                    console.error('List to save jobs is not selected or apiKey is not set.')
                                }
                            }, (e: Error) => {
                                console.error(e)
                            })

                        })
                }
            }
        })
    }
});

export default {}