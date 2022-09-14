import type {LocalStore} from "@/types";
import {useLocalStore} from "@/stores/local";
// @ts-ignore
import _ from 'lodash'

export const storageSetKey = (key: keyof LocalStore, value: any, onError?: Function) => {
    storageGet().then((stored: any) => {
        if (typeof stored !== 'object') {
            stored = useLocalStore().$state
        }
        stored[key] = value
        storageSet(stored)
    }, (e: any) => {
        if (typeof onError === "function") {
            onError(e)
        } else {
            console.error(e)
        }
    })
}
export const storageSet = (obj: any) => {
    const manageObj = _.cloneDeep(obj)
    const toStore = _.pickBy(manageObj, (val, key) => val !== undefined && val !== null)
    const toRemoveKeys = _.keys(_.pickBy(manageObj, (val, key) => val === undefined || val === null))

    return Promise.all([
        toRemoveKeys.length > 0 ? chrome.storage.local?.remove(toRemoveKeys) : true,
        chrome.storage.local?.set(toStore)
    ])
}
export const storageGet = () => chrome.storage.local?.get(null) || Promise.resolve(undefined)