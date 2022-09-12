import dayjs from "dayjs";
import {storageGet} from "@/localStorage";
import type {JobSentToClickUp, LocalStore} from "@/types";
import {getJobUniqueId} from "@/scrapper";

export const convertArrayToObject = (array: [], key: string) => {
    const initialValue = {};
    return array.reduce((obj, item) => {
        return {
            ...obj,
            [item[key]]: item,
        };
    }, initialValue);
};

export const pasteHtmlAtCaret = (html: string, selectPastedContent: boolean = true, container?: HTMLElement) => {
    let sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        const parentCont = sel?.anchorNode?.parentElement
        const inContainer = sel?.anchorNode === container || parentCont === container || parentCont?.parentElement === container
        const isHTMLIncludable = container?.className?.includes("html-includable")
        if (sel?.getRangeAt && sel.rangeCount && isHTMLIncludable && (!container || (container && inContainer))) {
            range = sel.getRangeAt(0);
            range.deleteContents();

            let el = document.createElement("span");
            el.innerHTML = html;
            let frag = document.createDocumentFragment(), node;
            let lastNode: Node
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            let firstNode = frag.firstChild;
            if (parentCont?.parentElement === container) {
                if (parentCont?.parentElement?.className?.includes("html-includable")) {
                    if (sel?.anchorNode === parentCont?.childNodes[0]) {
                        parentCont?.parentNode?.insertBefore(frag, sel?.anchorNode.parentNode)
                    } else if (sel?.anchorNode === parentCont?.childNodes[2]) {
                        if (sel?.anchorNode?.parentNode?.nextSibling) {
                            parentCont?.parentNode?.insertBefore(frag, sel?.anchorNode.parentNode.nextSibling)
                        } else {
                            parentCont?.parentNode?.appendChild(frag)
                        }
                    }
                } else if (parentCont?.tagName === "DIV" && parentCont?.className === undefined) {
                    range.insertNode(frag);
                }
            } else {
                range.insertNode(frag);
            }

            if (container) {
                setTimeout(() => {
                    container?.focus()
                    selectElementContents(lastNode)
                }, 0);
            }
        }
    }
}

export const saveSelection = () => {
    if (window.getSelection) {
        let sel = window.getSelection();
        if (sel?.getRangeAt && sel?.rangeCount) {
            return sel.getRangeAt(0);
        }
    }
    return null;
}

export const restoreSelection = (range: Range | null) => {
    if (range) {
        if (window.getSelection) {
            let sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }
}

export const selectElementContents = (el: Node | undefined, start: boolean = false) => {
    if (el) {
        let range = document.createRange();
        range.selectNodeContents(el);
        if (!start) {
            range.setStartAfter(el)
        } else {
            range.setStartBefore(el)
        }
        let sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
            if (!start) {
                sel.collapseToEnd()
            } else {
                sel.collapseToStart()
            }
        }
    }
}

export const unixToStr = (unix: EpochTimeStamp) => dayjs(unix).format('MMM D, YYYY')

export const addDollarSign = (sum: number) => `$${sum}`

export const labelSavedJobs = (jobs: NodeListOf<HTMLElement>) => {
    storageGet().then((stored: LocalStore) => {
        const savedJobs = stored.upworkJobsSentToClickUp
        if (savedJobs != undefined && savedJobs.length > 0) {
            for (let i = 0; i < jobs?.length; i++) {
                const job = jobs[i]
                const hasClickUpLink = job.querySelector('.cl-link')
                const link = job.querySelector('.job-tile-title a')?.getAttribute('href')
                if (link && !hasClickUpLink) {
                    const savedJob = savedJobs.find(j => link?.indexOf(j.job_id) >= 0)
                    if (savedJob) {
                        const actions = job.querySelector<HTMLElement>('.job-tile-actions')
                        if (actions) {
                            actions.style.width = '130px'

                            const clLink = document.createElement('a')
                            clLink.href = savedJob.task_url
                            clLink.target = "_blank"
                            clLink.className = "up-btn up-btn-default up-btn-circle cl-link"
                            clLink.addEventListener('click', (e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                window.open(savedJob.task_url, '_blank')
                            })

                            const image = document.createElement("img");
                            image.src = browser.runtime.getURL("images/cl-icon.png");
                            image.className = "clickup-icon"
                            image.style.width = '100%'
                            image.style.marginTop = '1px'

                            clLink.appendChild(image)
                            actions.appendChild(clLink)

                        }
                    }
                }
            }
        }
    })
}

export const isJobSaved = (uniqueId: string): Promise<JobSentToClickUp | undefined> => {
    return storageGet().then((stored: LocalStore) => {
        const savedJobs = stored?.upworkJobsSentToClickUp
        if (savedJobs != undefined && savedJobs.length > 0) {
            return savedJobs.find(j => j.job_id === uniqueId)
        } else {
            return undefined
        }
    })
}

export const canSaveJobs = () => {
    return storageGet().then((stored: LocalStore) => {
        const apiKey = stored?.clickUpApiToken
        const list = stored?.clickUpListToSaveJobs
        if (list && apiKey) {
            return true
        } else {
            return false
        }
    })
}

export const setIcon = (tabId: number, windowId: number, url: string) => {
    const uniqueId = getJobUniqueId(url)
    if (!uniqueId) {
        browser.browserAction.disable(tabId).then()
        return browser.browserAction.setIcon({path: '/images/disabled-48x48@1x.png', tabId, windowId})
    } else {
        return isJobSaved(uniqueId).then(savedJob => {
            if (savedJob) {
                browser.browserAction.enable(tabId).then()
                return browser.browserAction.setIcon({path: '/images/link-48x48@1x.png', tabId, windowId})
            } else {
                return canSaveJobs().then((canSave: boolean) => {
                    if (canSave) {
                        browser.browserAction.enable(tabId).then()
                    } else {
                        browser.browserAction.disable(tabId).then()
                    }
                    return browser.browserAction.setIcon({path: '/images/add-48x48@1x.png', tabId, windowId})
                })
            }
        })
    }
}

export const resetAllIcons = () => {
    browser.tabs.query({}).then((tabs) => {
        for (let i = 0; i < tabs.length; ++i) {
            const tabId = tabs?.[i]?.id
            if (tabId !== undefined) {
                browser.tabs.sendMessage(tabId, {action: "RESET_ALL_ICONS"}).then()
            }
        }
    })
}