import { isJobSaved, saveJob, setIcon, updateContextMenus } from "@/utils";
import { getJobUniqueId } from "@/scrapper";

chrome.contextMenus.create({
  id: "go-to-preferences",
  title: "Preferences",
  contexts: ["action"]
});
chrome.contextMenus.create({
  id: "save-job",
  title: "Save to ClickUp",
  contexts: ["action"],
  enabled: true
});

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo, tab) => {
  updateContextMenus(tab);
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "go-to-preferences":
      chrome.runtime.openOptionsPage();
      break;
    case "save-job":
      if (tab?.id !== undefined) {
        chrome.tabs
          .sendMessage(tab.id, { action: "PARSE_JOB_POSTING" })
          .then((response: any) => {
            saveJob(response.jobPosting, tab);
          });
      }
      break;
    default:
  }
});

chrome.runtime.onMessage.addListener((request: any, sender: chrome.runtime.MessageSender, sendResponse: Function) => {

  switch (request?.action) {
    case "LOCATION_CHANGED":
      if (sender?.tab !== undefined) {
        updateContextMenus(sender?.tab);
      }
    case "RESET_ICON":
      if (sender?.tab?.id !== undefined && sender?.tab?.windowId != undefined) {
        setIcon(sender.tab.id, sender.tab.windowId, request.data.location.href);
      }
      sendResponse(true);
      break;
    case "DISABLE_ACTION_ON_START":
      if (sender?.tab?.id !== undefined && sender?.tab?.windowId != undefined) {
        Promise
          .all([
            chrome.action.setIcon({
              path: "/images/disabled-48x48@1x.png",
              tabId: sender?.tab?.id
            }),
            chrome.action.disable(sender?.tab?.id)
          ])
          .then(() => {
            console.log("disabled action icon");
            sendResponse(true);
          });
      }
      break;
    default:
      console.error(
        request?.action === undefined
          ? "No action provided"
          : "No such action: " + request?.action
      );
  }
});

chrome.action.onClicked.addListener(function(tab: chrome.tabs.Tab) {
  const uniqueId = getJobUniqueId(tab.url);
  if (uniqueId) {
    isJobSaved(uniqueId).then((savedJob) => {
      if (savedJob?.length !== undefined && savedJob?.length > 0) {
        if (tab?.id !== undefined) {
          chrome.tabs.sendMessage(tab.id, { action: "OPEN_URL_IN_NEW_TAB", data: { url: savedJob[0].task_url } });
        }
      } else {
        if (tab?.id !== undefined) {
          chrome.tabs
            .sendMessage(tab.id, { action: "PARSE_JOB_POSTING" })
            .then((response: any) => {
              saveJob(response.jobPosting, tab);
            });
        }
      }
    });
  }
});

export default {};