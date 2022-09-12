<template>
  <h4>Match with fields in ClickUp Task</h4>
  <div>
    <FormEditableField v-for="field in fields" :key="field?.id || field?.name" :customField="field"/>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue"
import type {Ref} from "vue"
import {useLocalStore} from "@/stores/local";
import FormEditableField from '@/components/FormEditableField.vue'
import type {ClickUpCustomFieldDefinition} from "@/types";
import {STANDARD_CU_FIELDS} from "@/config";

const standardFields: ClickUpCustomFieldDefinition[] = STANDARD_CU_FIELDS
const fields: Ref<any[]> = ref([])
const local = useLocalStore()
const nonStandardCfs = computed(() => local.filteredFieldsByTypeInList(['text', 'short_text', 'date', 'number', 'checkbox', 'url', 'currency']))

watch(nonStandardCfs, cfs => {
  fields.value = [...standardFields, ...cfs]
})

</script>

<style scoped>

</style>