<template>
  <div class="row">
    <div class="col">
      <div class="mb-3">
        <button type="button" class="btn btn-outline-danger" @click="clearAllPreferences">Clear all Preferences</button>
      </div>
      <div class="mb-3">
        <button type="button" class="btn btn-outline-danger" @click="forgetSavedJobs">
          Forget all saved jobs ({{ savedJobsCount }})
        </button>
        <p class="mb-0 text-muted">(Doesn't influence any tasks in ClickUp)</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useLocalStore} from "@/stores/local";
import {computed} from "vue";

const local = useLocalStore()
const clearAllPreferences = () => {
  local.setClickUpListToSaveJobs(undefined)
  local.setClickUpApiToken(undefined)
  local.setTaskFieldMarkupObj({})
}

const savedJobsCount = computed(() => local.$state.upworkJobsSentToClickUp?.length || 0)

const forgetSavedJobs = () => {
  local.setUpworkJobsSentToClickUp([])
}
</script>

<style scoped lang="scss">

</style>