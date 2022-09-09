import {defineStore} from "pinia";
import {computed, ref, watch} from "vue";
import type {Ref} from "vue";
import {storageGet, storageSetKey} from "@/localStorage";
import type {ClFieldType, ClList, JobSentToClickUp, LocalStore} from "@/types";
import apiClient from "@/apiClient";
import {STANDARD_CU_FIELDS} from "@/config";

export const useLocalStore = defineStore('local', () => {
    const clickUpApiToken: Ref<string> = ref("")
    const clickUpListToSaveJobs: Ref<undefined | ClList | null> = ref(undefined)
    const availableFieldsInList: Ref<any[]> = ref([])
    const filteredFieldsByTypeInList = computed(
        () => (types: ClFieldType[]) => availableFieldsInList.value?.length > 0 ? availableFieldsInList.value.filter((cf) => types.includes(cf.type)) : [])
    const getById = computed(
        () => (id: string) => availableFieldsInList.value?.length > 0 ? availableFieldsInList.value.find((cf) => cf.id === id) : undefined
    )
    const upworkJobsSentToClickUp: Ref<JobSentToClickUp[]> = ref([])
    const patched: Ref<boolean> = ref(false)

    const taskFieldMarkup: Ref<{ [key: string]: { type: ClFieldType, markup: string } }> = ref({})

    function setClickUpApiToken(token: string) {
        clickUpApiToken.value = token
    }

    function setClickUpListToSaveJobs(list: ClList) {
        clickUpListToSaveJobs.value = list
    }

    function fetchAccessibleCustomFields() {
        if (clickUpListToSaveJobs.value) {
            apiClient(clickUpApiToken.value)
                .get(`list/${clickUpListToSaveJobs.value?.id}/field`)
                .then((res: any) => {
                    availableFieldsInList.value = res.fields
                })
        }
    }

    function setTaskFieldMarkup(inputNodes: Array<HTMLElement>, fieldId: string) {
        let text = ""
        for (let i = 0; i < inputNodes?.length; i++) {
            if (inputNodes?.[i]?.className !== undefined && inputNodes?.[i]?.className?.includes('field-container')) {
                text += `{{${inputNodes?.[i].dataset.field}}}`
            } else {
                if (!inputNodes?.[i].nodeValue && inputNodes?.[i].outerHTML) {
                    const newLineInputNodes: Array<ChildNode> = Array.from(inputNodes?.[i]?.childNodes)
                    const newLineInputElements: Array<Element> = Array.from(inputNodes?.[i]?.children)
                    if (newLineInputNodes?.length > 0) {
                        text += "<div>"
                        for (let c = 0; c < newLineInputNodes?.length; c++) {
                            const element = newLineInputElements.find((node: Element) => node.isEqualNode(newLineInputNodes?.[c])) as HTMLElement | undefined
                            if (element && element.className !== undefined && element.className?.includes('field-container')) {
                                text += `{{${element.dataset.field}}}`
                            } else if (newLineInputNodes?.[c].nodeValue) {
                                text += newLineInputNodes?.[c].nodeValue
                            }
                        }
                        text += "</div>"
                    }
                    // text += inputNodes?.[i].nodeValue || inputNodes?.[i].outerHTML
                } else if (inputNodes?.[i].nodeValue) {
                    text += inputNodes?.[i].nodeValue
                }
            }
        }
        const field = getById.value(fieldId) || STANDARD_CU_FIELDS.find(f => f.id === fieldId)
        taskFieldMarkup.value[fieldId] = {type: field?.type, markup: text}
    }

    watch(clickUpListToSaveJobs, () => {
        fetchAccessibleCustomFields()
    }, {deep: true})

    return {
        clickUpApiToken,
        clickUpListToSaveJobs,
        availableFieldsInList,
        upworkJobsSentToClickUp,
        taskFieldMarkup,
        patched,

        filteredFieldsByTypeInList,

        setClickUpApiToken,
        setClickUpListToSaveJobs,
        fetchAccessibleCustomFields,
        setTaskFieldMarkup,
    }
});