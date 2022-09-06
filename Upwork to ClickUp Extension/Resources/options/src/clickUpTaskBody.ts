import type {ClickUpCustomField, ClickUpTask, JobPosting, ClFieldType} from "@/types";
import {JOB_FIELDS_TYPES} from "@/config"

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

            // return arg2 && jobPosting?.[arg2] !== undefined ? jobPosting?.[arg2] + "" : ""
        }) : ""
}
export const prepClickUpBody = (jobPosting: JobPosting, markup: { [key: string]: { type: ClFieldType, markup: string } }) => {
    console.log('prepClickUpBody', jobPosting, markup)
    const customFields: ClickUpCustomField[] = Object.keys(markup).reduce<{ id: string, value: string }[]>((carry, id) => {
        if (!['task.name', 'task.description', 'task.due_date', 'task.start_date'].includes(id)) {
            carry.push({
                id,
                value: replaceFields(markup?.[id], jobPosting)
            })
        }
        return carry
    }, [])
    console.log(customFields)
    const task: ClickUpTask = {
        "name": replaceFields(markup?.["task.name"], jobPosting),
        "description": replaceFields(markup?.["task.description"], jobPosting),
        // "tags": ["tag name 1"],
        // "status": "Open",
        // "priority": 3,
        "due_date": parseInt(replaceFields(markup?.["task.due_date"], jobPosting)),
        // "due_date_time": false,
        "start_date": parseInt(replaceFields(markup?.["task.start_date"], jobPosting)),
        // "start_date_time": false,
        // "custom_fields": [{
        //     "id": "0a52c486-5f05-403b-b4fd-c512ff05131c", "value": 23
        // }, {
        //     "id": "03efda77-c7a0-42d3-8afd-fd546353c2f5", "value": "Text field input"
        // }]
        "custom_fields": customFields
    }
    console.log(task)
    return task
}