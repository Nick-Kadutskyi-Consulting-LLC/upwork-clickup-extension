import axios from 'axios'
import {API_BASE_DOMAIN, API_BASE_URL} from "@/config";

const baseURL = `${API_BASE_DOMAIN}${API_BASE_URL}`
const axiosClient = (authToken: string) => (axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: authToken,
    },
    withCredentials: true,
}))

const apiClient = (authToken?: string | null) => {
    if (authToken !== undefined && authToken !== null) {
        const options = {
            credentials: 'same-origin' as RequestCredentials, // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                Authorization: authToken
            },
            withCredentials: true,
        }
        return {
            get(resource: string) {
                return fetch(`${baseURL}/${resource}`, {
                    ...options,
                    method: 'GET'
                }).then(r => r?.json())
            },

            post(resource: string, body: any) {
                return fetch(`${baseURL}/${resource}`, {
                    ...options,
                    method: 'POST',
                    body: JSON.stringify(body)
                }).then(r => r?.json())
            },

            put(resource: string, body: any) {
                return fetch(`${baseURL}/${resource}`, {
                    ...options,
                    method: 'PUT',
                    body: JSON.stringify(body)
                }).then(r => r?.json())
            },
            delete(resource: string) {
                return fetch(`${baseURL}/${resource}`, {
                    ...options,
                    method: 'DELETE',
                }).then(r => r?.json())
            }
        }
    } else {
        return {
            get: (...args: any) => Promise.reject("No auth token"),
            post: (...args: any) => Promise.reject("No auth token"),
            put: (...args: any) => Promise.reject("No auth token"),
            delete: (...args: any) => Promise.reject("No auth token")
        }
    }
}

export default apiClient
