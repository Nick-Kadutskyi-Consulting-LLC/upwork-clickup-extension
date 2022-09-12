import dayjs from "dayjs";
import * as chrono from 'chrono-node';

const numeral = require('numeral')

export const xPathContains = (tag: string, text: string) => {
    const xpath = `//${tag}[contains(text(),'${text}')]`;
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)?.singleNodeValue;
}

export const getTitle = () => {
    try {
        const titleHTML = document.querySelector('header.up-card-header h1') as HTMLElement

        return titleHTML?.innerText
    } catch (e) {
        console.error('getTitle', e)
        return undefined
    }
}
export const getDescription = () => {
    try {
        const descrHTML = document.querySelector('.job-description') as HTMLElement

        return descrHTML?.innerText
    } catch (e) {
        console.error('getDescription', e)
        return undefined
    }
}
export const getPaymentVerificationStatus = () => {
    try {
        if (xPathContains('span', 'Payment method not verified')) {
            return false;
        } else if (xPathContains('strong', 'Payment method verified')) {
            return true;
        }

        return false
    } catch (e) {
        console.error('getPaymentVerificationStatus', e)
        return false
    }
}
export const getJobUniqueId = (url?: string): string | undefined => {
    try {
        const match = (url !== undefined ? url : window.location.href).match(/~(.{18})/);
        const jId = match ? match[1] : undefined;

        return jId;
    } catch (e) {
        console.error('getJobUniqueId', e)
        return undefined
    }
}
export const getJobUrl = (): string | undefined => {
    try {
        return window.location.href
    } catch (e) {
        console.error('getJobUrl', e)
        return undefined
    }
}
export const getCountry = (): string | undefined => {
    try {
        return document.querySelector('[data-qa="client-location"]')?.getElementsByTagName('strong')?.[0]?.innerText.trim() || undefined
    } catch (e) {
        console.error('getCountry', e)
        return undefined
    }
}
export const getCity = (): string | undefined => {
    try {
        const clientLocation = document.querySelector('[data-qa="client-location"]')
        const cityContainer = clientLocation?.getElementsByTagName('DIV')?.[0]
        const city = cityContainer?.getElementsByTagName('span')?.[0]?.innerText.trim()

        return city || undefined
    } catch (e) {
        console.error('getCity', e)
        return undefined
    }
}

export const getJobType = (): 'hourly' | 'fixed-price' | undefined => {
    try {
        if (xPathContains('small', 'Fixed-price')) {
            return "fixed-price";
        } else if (xPathContains('small', 'Hourly')) {
            return "hourly";
        }

        return undefined
    } catch (e) {
        console.error('getJobType', e)
        return undefined
    }
}

export const getDatePosted = (): number | undefined => {
    try {
        const jobPosted: HTMLElement = xPathContains('span', 'Posted') as HTMLElement;
        const dateTime: string = jobPosted?.getElementsByTagName('span')?.[0]?.innerText

        return dateTime ? dayjs(chrono.parseDate(dateTime)).valueOf() : undefined
    } catch (e) {
        console.error('getDatePosted', e)
        return undefined
    }
}

export const getBudget = (): number | undefined => {
    try {
        const fixed = xPathContains('small', 'Fixed-price')
        const sum = fixed?.parentElement?.querySelector('.header')?.getElementsByTagName('strong')?.[0]?.innerText

        return sum ? numeral(sum).value() : undefined
    } catch (e) {
        console.error('getBudget', e)
        return undefined
    }

}

export const getTotalSpent = (): number | undefined => {
    try {
        const totSpent = document.querySelector('[data-qa="client-spend"]');
        const sum = totSpent?.getElementsByTagName('span')?.[0]?.innerText?.trim()?.replace('+', '')

        return sum ? numeral(sum).value() : undefined
    } catch (e) {
        console.error('getTotalSpent', e)
        return undefined
    }
}