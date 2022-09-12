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
export const storageSet = (obj: any) => browser.storage.local?.set(_.cloneDeep(obj))
export const storageGet = () => browser.storage.local?.get() || Promise.resolve(undefined)