import {storageGet, storageSet} from "@/localStorage";
import type {LocalStore} from "@/types";
import {prepClickUpBody} from "@/clickUpTaskBody";
import {isJobSaved, resetAllIcons, saveJob, setIcon, updateContextMenus} from "@/utils";
import type {Runtime, Tabs} from "webextension-polyfill";
import {getJobUniqueId} from "@/scrapper";

browser.contextMenus.create({
    id: "go-to-preferences",
    title: "Preferences",
    contexts: ['browser_action'],
})
browser.contextMenus.create({
    id: "save-job",
    title: "Save to ClickUp",
    contexts: ['browser_action'],
    enabled: true,
})

browser.tabs.onUpdated.addListener((tabId: number, changeInfo, tab) => {
    updateContextMenus(tab)
})


browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "go-to-preferences":
            browser.runtime.openOptionsPage().then()
            break;
        case "save-job":
            if (tab?.id !== undefined) {
                browser.tabs
                    .sendMessage(tab.id, {action: "PARSE_JOB_POSTING"})
                    .then((response: any) => {
                        saveJob(response.jobPosting, tab)
                    })
            }
            break
        default:
    }
})

browser.runtime.onMessage.addListener((request: any, sender: Runtime.MessageSender) => {

    return new Promise((resolve, reject) => {
        switch (request?.action) {
            case "LOCATION_CHANGED":
                if (sender?.tab !== undefined) {
                    updateContextMenus(sender?.tab)
                }
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
                if (tab?.id !== undefined) {
                    browser.tabs
                        .sendMessage(tab.id, {action: "PARSE_JOB_POSTING"})
                        .then((response: any) => {
                            saveJob(response.jobPosting, tab)
                        })
                }
            }
        })
    }
});

export default {}