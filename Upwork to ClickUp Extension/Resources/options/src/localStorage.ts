import type {LocalStore} from "@/types";
import {useLocalStore} from "@/stores/local";
/* global browser */
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
    return (typeof browser !== "undefined" ? browser : chrome)?.storage?.local?.set(Object.assign({}, obj))
}

export const storageGet = () => {
    return (typeof browser !== "undefined" ? browser : chrome)?.storage?.local?.get() || Promise.resolve()
}