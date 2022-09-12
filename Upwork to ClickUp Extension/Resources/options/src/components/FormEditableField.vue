<template>
  <div class="mb-4" ref="fieldEl">
    <label
        :for="customField.id"
        class="form-label fs-5"
        @click="input.focus()"
    >
      {{ customField.name }}
      <span class="text-muted fs-7 fw-light">
        {{ customField.id }}
      </span>
    </label>
    <div class="input-group mb-3">
      <span class="input-group-text">
        <font-awesome-icon fixed-width icon="fa-solid fa-calendar-days" v-if="customField.type === 'date'"/>
        <font-awesome-icon fixed-width icon="fa-solid fa-italic"
                           v-if="['text', 'short_text'].includes(customField?.type)"/>
        <font-awesome-icon fixed-width icon="fa-solid fa-square-check" v-if="['checkbox'].includes(customField.type)"/>
        <font-awesome-icon fixed-width icon="fa-solid fa-hashtag" v-if="['number'].includes(customField.type)"/>
        <font-awesome-icon fixed-width icon="fa-solid fa-link" v-if="['url'].includes(customField.type)"/>
        <font-awesome-icon fixed-width icon="fa-solid fa-dollar" v-if="['currency'].includes(customField.type)"/>
      </span>
      <div class="form-control input-field"
           :class="{disabled, 'html-includable': !disabled}"
           :id="customField.id"
           :contenteditable="!disabled && !['date', 'checkbox', 'number', 'currency'].includes(customField.type)"
           ref="input"
           @input="event => onInput(event)"
           @keyup.delete="onRemove()"
           @keyup="checkCaret"
           @keydown.enter.prevent=""
      ></div>
      <button
          class="btn btn-outline-secondary"
          type="button"
          @click="clearField"
      >
        <font-awesome-icon fixed-width icon="fa-solid fa-xmark"/>
      </button>
    </div>
    <div class="">
      <p class="mt-2 mb-0 small">
        <span class="text-uppercase text-muted opacity-75">fields from Job Posting</span>
        <br>
        <span class="text-muted fw-light">(click to add to {{ customField.name }})</span>
      </p>
      <span
          v-for="field in jobFieldsAvailable"
          :key="field.name"
          class="badge unselectable me-1"
          :class="hovered?.[field.name] ? 'text-bg-primary' : 'text-bg-secondary'"
          @mouseover="hovered[field.name] = true"
          @mouseout="hovered[field.name] = false"
          @mousedown="addJobField(field)"
          :style="{'--bs-bg-opacity': hovered[field.name] ? '1' : '.5' }"
      >
        {{ field.name }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {JOB_FIELDS, JOB_FIELDS_TYPES} from "@/config";
import {computed, onMounted, ref, watch} from "vue";
import type {Ref} from "vue"
import {pasteHtmlAtCaret, restoreSelection, saveSelection, selectElementContents} from "@/utils";
import {useLocalStore} from "@/stores/local";
import type {ClickUpCustomFieldDefinition, JobFieldsDefinition, ClFieldType} from "@/types";

/* global font-awesome-icon */
const {jobFields = JOB_FIELDS_TYPES, customField} = defineProps<{
  jobFields?: JobFieldsDefinition[],
  customField: ClickUpCustomFieldDefinition,
}>()

const jobFieldsAvailable = computed(() => jobFields.filter(f => f.types.includes(customField.type)))

const local = useLocalStore()
const disabled = ref(true)
const input = ref()

const hovered: Ref<{ [key: string]: boolean }> = ref(JOB_FIELDS.reduce((o, key) => ({...o, [key]: false}), {}))

const addJobField = (field: JobFieldsDefinition) => {
  if (['date', 'checkbox', 'number', 'currency'].includes(customField.type)) {
    input.value.innerHTML = getTagHTML(field.name)
  } else {
    if (document.activeElement !== input.value) {
      input.value.focus()
      selectElementContents(input.value.childNodes?.[input.value.childNodes?.length - 1], false)
    }
    pasteHtmlAtCaret(getTagHTML(field.name), true, input.value)
  }
  local.setTaskFieldMarkup(input.value.childNodes, customField.id)
}
const spaceEl = document.createElement('span')
spaceEl.innerHTML = "&#xFEFF;"
const space = spaceEl.childNodes[0].nodeValue

const clearField = () => {
  input.value.innerHTML = ''
  local.setTaskFieldMarkup(input.value.childNodes, customField.id)
}

const onInput = (event: Event) => {
  const value = input.value.innerHTML;
  const preventEditing = input.value.querySelectorAll('.contenteditable-false')
  for (let i = 0; i < preventEditing.length; i++) {
    preventEditing[i].setAttribute('contenteditable', false)
  }
  const children = input.value.childNodes

  for (let i = 0; i < children.length; i++) {
    if (children[i]?.className?.includes('field-container')) {
      const fieldChildren = children[i].childNodes

      if (fieldChildren[0]?.nodeValue !== space) {
        const newTextNode: Text = document.createTextNode(fieldChildren[0]?.nodeValue.replace(/[\uFEFF]/gi, ''))
        children[i].parentNode.insertBefore(newTextNode, children[i]);
        fieldChildren[0].nodeValue = space

        setTimeout(function () {
          selectElementContents(newTextNode)
        }, 0);
      }
      if (fieldChildren[2]?.nodeValue && fieldChildren[2]?.nodeValue !== space) {
        const newTextNode: Text = document.createTextNode(fieldChildren[2].nodeValue.replace(/[\uFEFF]/gi, ''))
        children[i].parentNode.insertBefore(newTextNode, children[i].nextSibling);
        fieldChildren[2].nodeValue = space

        setTimeout(function () {
          selectElementContents(newTextNode)
        }, 0);
      }
    }
  }

  local.setTaskFieldMarkup(input.value.childNodes, customField.id)
}
const onRemove = () => {
  const fields = input.value.querySelectorAll('.field-container')
  for (let i = 0; i < fields.length; i++) {
    const fieldChildren = fields[i].childNodes
    if (fieldChildren.length < 3) {
      fields[i].remove()
    }
  }
}
let prevNodeCaret: any | null = null
const checkCaret = () => {
  if (window.getSelection()) {
    const sel = window.getSelection();
    const parentContainer = sel?.anchorNode?.parentElement
    if (parentContainer?.className?.includes('field-container')) {
      const children = sel?.anchorNode?.parentElement?.childNodes
      if (sel?.anchorOffset === 0 && sel?.anchorNode === children?.[2]) {
        prevNodeCaret = sel?.anchorNode
        selectElementContents(parentContainer, true)
      } else if (
          sel?.anchorNode === children?.[0]
          && (
              (sel?.anchorOffset === 0 && prevNodeCaret === parentContainer.previousSibling)
              || (sel?.anchorOffset === 1)
          )
      ) {
        prevNodeCaret = sel?.anchorNode
        selectElementContents(parentContainer, false)
      } else {
        prevNodeCaret = sel?.anchorNode
      }
    } else {
      prevNodeCaret = sel?.anchorNode
    }
  }
}

const getTagHTML = (field: string) => {
  return `<span class="field-container" data-field="${field}">&#xFEFF;<span class="contenteditable-false" contenteditable="false"><span class="badge text-bg-primary field-value">${field}</span></span>&#xFEFF;</span>`
}
const assignInput = (fieldMarkup: { type: ClFieldType, markup: string }) => {
  let text = fieldMarkup?.markup
  if (typeof text === "string") {
    text = text?.replace(/(\{\{([^{}]*)\}\}?)/gi, (match, p1, p2, offset, string, groups) => {
      return getTagHTML(p2)
    })
    input.value.innerHTML = text
  }
}

// const fieldEl = ref()
// const tooltipList: Ref<any[]> = ref([])
onMounted(() => {
  // const tooltipTriggerList = fieldEl.value.querySelectorAll('[data-bs-toggle="tooltip"]')
  // tooltipList.value = [...tooltipTriggerList].map(tooltipTriggerEl => new window.bootstrap.Tooltip(tooltipTriggerEl))
  if (local.$state.patched) {
    assignInput(local.$state.taskFieldMarkup[customField.id])
    disabled.value = false
  } else {
    const stopWatching = watch(() => local.$state.patched, patched => {
      if (patched) {
        assignInput(local.$state.taskFieldMarkup[customField.id])
        stopWatching()
        disabled.value = false
      }
    }, {deep: true})
  }
})

</script>

<style scoped>
.badge {
  cursor: pointer;
}

.unselectable {
  -khtml-user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/*[contenteditable=true] {*/
.conteneditable-false {
  -webkit-user-select: text;
  user-select: text;
}

.input-field.disabled {
  background-color: #e9ecef;
  opacity: 1;
}
</style>

<style>
.field-value {
  margin: 0 1px 0 1px;
}
</style>