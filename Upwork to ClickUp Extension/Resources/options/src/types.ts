import type {Browser} from "webextension-polyfill";

declare global {
    const browser: Browser

    interface Window {
        bootstrap: any;
    }

    const require: any;
    namespace NodeJS {
        interface ProcessEnv {
            LIB_NAME: string;
        }
    }
}

export interface ClTeam {
    name: string;
    id: string;
}

export interface ClSpace {
    name: string;
    id: string;
    teamId: string;
}

export interface ClFolder {
    name: string;
    id: string;
    spaceId: string;
}

export interface ClList {
    name: string;
    id: string;
    folderId?: string;
    spaceId?: string;
    space?: ClSpace;
    folder?: ClFolder;
}

export interface JobSentToClickUp {
    task_id: string;
    task_title: string;
    task_url: string;
    job_id: string;
    job_title: string;
    job_date_posted: number;
}

export interface LocalStore extends Record<string, any> {
    clickUpApiToken?: string;
    clickUpListToSaveJobs?: ClList | undefined | null;
    availableFieldsInList?: any[];
    upworkJobsSentToClickUp?: JobSentToClickUp[];
    taskFieldMarkup?: { [key: string]: { type: ClFieldType, markup: string } };
    patched?: boolean;
}

export type ClFieldType =
    'url'
    | 'drop_down'
    | 'email'
    | 'phone'
    | 'date'
    | 'text'
    | 'checkbox'
    | 'number'
    | 'currency'
    | 'tasks'
    | 'users'
    | 'emoji'
    | 'labels'
    | 'automatic_progress'
    | 'manual_progress'
    | 'short_text'
    | 'location'

export enum ClFieldTypeInt {
    url = 0,
    drop_down = 1,
    email = 2,
    phone = 3,
    date = 4,
    text = 5,
    checkbox = 6,
    number = 7,
    currency = 8,
    tasks = 9,
    users = 10,
    emoji = 11,
    labels = 13,
    automatic_progress = 14,
    manual_progress = 15,
    short_text = 16,
    location = 17,
}

export interface JobPosting {
    "Job Name": string;
    "Job Description"?: string;
    "Payment Verified"?: boolean;
    "Job Unique ID": string;
    "Job URL"?: string;
    "Job Country"?: string;
    "Job City"?: string;
    "Job Type"?: "fixed-price" | "hourly";
    "Date Posted": number;
    "Budget"?: number;
    "Total Spent"?: number
}

export interface ClickUpCustomField {
    id: string;
    value: any;
}

export interface ClickUpTask {
    name?: string;
    description?: string;
    tags?: string[];
    priority?: number;
    due_date?: EpochTimeStamp;
    due_date_time?: boolean;
    start_date?: EpochTimeStamp;
    start_date_time?: boolean;
    custom_fields?: ClickUpCustomField[];
}

export type JobFieldsDefinition = { name: keyof JobPosting, types: ClFieldType[], handlers?: { [key in ClFieldType]?: Function } }

export interface ClickUpCustomFieldDefinition {
    name: string;
    type: ClFieldType,
    id: string,
}

export {}