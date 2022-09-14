import type {ClFieldType, JobFieldsDefinition, JobPosting, ClickUpCustomFieldDefinition} from "@/types";
import {addDollarSign, unixToStr} from "@/utils";
import dayjs from "dayjs";

export const API_BASE_DOMAIN = "https://api.clickup.com"
export const API_BASE_URL = "/api/v2"
export const JOB_FIELDS: string[] = ['Job Name', 'Job Description']
export const JOB_FIELDS_TYPES: JobFieldsDefinition[] = [
    {
        name: 'Job Name',
        types: ['text', 'short_text'],
    },
    {
        name: 'Job Description',
        types: ['text', 'short_text'],
    },
    {
        name: 'Payment Verified',
        types: ['text', 'short_text', 'checkbox', 'number'],
    },
    {
        name: 'Job Unique ID',
        types: ['text', 'short_text'],
    },
    {
        name: 'Job URL',
        types: ['text', 'short_text', 'url'],
    },
    {
        name: 'Job Country',
        types: ['text', 'short_text'],
    },
    {
        name: 'Job City',
        types: ['text', 'short_text'],
    },
    {
        name: 'Job Type',
        types: ['text', 'short_text'],
    },
    {
        name: 'Date Posted',
        types: ['text', 'short_text', 'date', 'number'],
        handlers: {
            short_text: (unix: EpochTimeStamp) => dayjs(unix).format('MMM D, YYYY'),
            text: (unix: EpochTimeStamp) => dayjs(unix).format('MMM D, YYYY')
        }
    },
    {
        name: 'Budget',
        types: ['text', 'short_text', 'number', 'currency'],
        handlers: {
            short_text: (sum: number) => `$${sum}`,
            text: (sum: number) => `$${sum}`,
        }
    },
    {
        name: 'Total Spent',
        types: ['text', 'short_text', 'number', 'currency'],
        handlers: {
            short_text: (sum: number) => `$${sum}`,
            text: (sum: number) => `$${sum}`,
        }
    }
]

export const STANDARD_CU_FIELDS: ClickUpCustomFieldDefinition[] = [
    {
        name: "Task Name",
        type: "short_text",
        id: "task.name",
    },
    {
        name: "Task Description",
        type: "text",
        id: "task.description",
    },
    {
        name: "Task Due Date",
        type: "date",
        id: "task.due_date",
    },
    {
        name: "Task Start Date",
        type: "date",
        id: "task.start_date",
    },
]