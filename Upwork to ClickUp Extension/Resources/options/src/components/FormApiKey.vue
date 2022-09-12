<template>
  <div class="mb-3">
    <label for="clApiToken" class="form-label fs-5">ClickUp API Key</label>
    <div class="input-group mb-3">
      <input
          v-model="apiKey"
          type="text"
          class="form-control"
          id="clApiToken"
          placeholder="pk_..."
          @input="storeApiKey"
          aria-describedby="btn-clear"
      >
      <button
          class="btn btn-outline-secondary"
          type="button"
          id="btn-clear"
          @click="clearApiKey"
      >Clear
      </button>
    </div>
    <div id="clApiTokenHelp" class="form-text">
      <a
          target="_blank"
          href="https://help.clickup.com/hc/en-us/articles/6303426241687-Getting-Started-with-the-ClickUp-API#personal-api-key">
        How to get your Personal API Key?
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {Ref} from "vue"
import {useLocalStore} from "@/stores/local";
import type {LocalStore} from "@/types";

const local = useLocalStore()
const storedApiKey = computed(() => local.$state.clickUpApiToken)

const apiKey: Ref<string | undefined | null> = ref("")

watch(storedApiKey, key => {
  apiKey.value = key
})

const storeApiKey = () => {
  local.setClickUpApiToken(apiKey.value)
}
const clearApiKey = () => {
  local.setClickUpApiToken(undefined)
}
</script>

<style scoped lang="scss">

</style>