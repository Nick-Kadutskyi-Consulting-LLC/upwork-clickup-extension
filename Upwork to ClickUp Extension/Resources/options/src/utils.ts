import dayjs from "dayjs";
import {storageGet, storageSet} from "@/localStorage";
import type {JobPosting, JobSentToClickUp, LocalStore} from "@/types";
import {getJobUniqueId} from "@/scrapper";
import {prepClickUpBody} from "@/clickUpTaskBody";

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
                            image.src = chrome.runtime.getURL("images/cl-icon.png");
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

export const isJobSaved = (uniqueId: string): Promise<JobSentToClickUp[] | undefined> => {
    return storageGet().then((stored: LocalStore) => {
        const savedJobs = stored?.upworkJobsSentToClickUp
        if (savedJobs != undefined && savedJobs.length > 0) {
            return savedJobs.filter(j => j.job_id === uniqueId)
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
        chrome.action.disable(tabId).then()
        return chrome.action.setIcon({path: '/images/disabled-48x48@1x.png', tabId})
    } else {
        return isJobSaved(uniqueId).then(savedJob => {
            if (savedJob?.length !== undefined && savedJob?.length > 0) {
                chrome.action.enable(tabId).then()
                return chrome.action.setIcon({path: '/images/link-48x48@1x.png', tabId})
            } else {
                return canSaveJobs().then((canSave: boolean) => {
                    if (canSave) {
                        chrome.action.enable(tabId).then()
                    } else {
                        chrome.action.disable(tabId).then()
                    }
                    return chrome.action.setIcon({path: '/images/add-48x48@1x.png', tabId})
                })
            }
        })
    }
}

export const resetAllIcons = () => {
    return chrome.tabs.query({url: "*://*.upwork.com/*"}).then((tabs) => {
        const promises: Promise<any>[] = []
        for (let i = 0; i < tabs.length; ++i) {
            const tabId = tabs?.[i]?.id
            if (tabId !== undefined) {
                promises.push(chrome.tabs.sendMessage(tabId, {action: "RESET_ALL_ICONS"}))
            }
        }
        return Promise.all(promises)
    })
}

export const saveJob = (jobPosting: JobPosting, tab: chrome.tabs.Tab) => {
    storageGet().then((stored: LocalStore) => {
        const apiKey = stored?.clickUpApiToken
        const list = stored?.clickUpListToSaveJobs
        if (list && apiKey) {
            chrome.action.disable(tab.id).then()
            chrome.action.setIcon({
                tabId: tab.id,
                path: '/images/loading-48x48@1x.png'
            })
            fetch(`https://api.clickup.com/api/v2/list/${list?.id}/task`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: apiKey
                },
                body: JSON.stringify(prepClickUpBody(jobPosting, stored?.taskFieldMarkup))
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
                        job_id: jobPosting["Job Unique ID"],
                        job_title: jobPosting["Job Name"],
                        job_date_posted: jobPosting["Date Posted"]
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
}

export const updateContextMenus = (tab: chrome.tabs.Tab) => {
    const uniqueId = getJobUniqueId(tab.url)
    if (!!uniqueId) {
        canSaveJobs().then((canSave: boolean) => {
            if (canSave) {
                chrome.contextMenus.update('save-job', {enabled: true})
            }
        })
    } else {
        chrome.contextMenus.update('save-job', {enabled: false})
    }
}