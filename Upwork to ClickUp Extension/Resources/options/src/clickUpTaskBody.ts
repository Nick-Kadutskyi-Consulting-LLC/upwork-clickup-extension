import type {ClickUpCustomField, ClickUpTask, JobPosting, ClFieldType} from "@/types";
import {JOB_FIELDS_TYPES, STANDARD_CU_FIELDS} from "@/config"

export const replaceFields = (fieldMarkup: { type: ClFieldType, markup: string }, jobPosting: JobPosting) => {
    return fieldMarkup?.markup ? fieldMarkup?.markup?.replace(
        /(\{\{([^{}]*)\}\}?)/gi,
        (substring: string, arg1?: any, arg2?: keyof JobPosting) => {
            const jobField = JOB_FIELDS_TYPES.find(f => f.name === arg2)
            const handler = jobField?.handlers?.[fieldMarkup?.type]

            return arg2 && jobPosting?.[arg2] !== undefined
                ? (typeof handler === "function"
                    ? handler(jobPosting?.[arg2])
                    : jobPosting?.[arg2] + "")
                : ""
        }) : ""
}
export const prepClickUpBody = (jobPosting: JobPosting, markup?: { [key: string]: { type: ClFieldType, markup: string } }) => {
    const customFields: ClickUpCustomField[] | [] = markup != undefined
        ? Object.keys(markup).reduce<{ id: string, value: string }[]>(
            (carry, id) => !STANDARD_CU_FIELDS.find(f => f.id === id)
                ? [...carry, {id, value: replaceFields(markup?.[id], jobPosting)}]
                : carry,
            [])
        : []
    const task: ClickUpTask = {
        "name": !!markup?.["task.name"] ? replaceFields(markup?.["task.name"], jobPosting) : jobPosting["Job Name"],
        "description": !!markup?.["task.description"] ? replaceFields(markup?.["task.description"], jobPosting) : jobPosting["Job Description"],
        // "tags": ["tag name 1"],
        // "status": "Open",
        // "priority": 3,
        "due_date": !!markup?.["task.due_date"] ? parseInt(replaceFields(markup?.["task.due_date"], jobPosting)) : undefined,
        "start_date": !!markup?.["task.start_date"] ? parseInt(replaceFields(markup?.["task.start_date"], jobPosting)) : undefined,
        "custom_fields": customFields
    }
    return task
}