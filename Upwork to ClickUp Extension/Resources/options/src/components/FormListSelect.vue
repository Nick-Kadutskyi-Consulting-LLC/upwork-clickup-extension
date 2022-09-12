<template>
  <h4>List to save Upwork Leads to</h4>
  <div class="mb-3" v-if="selectedList">
    <label for="clApiToken" class="form-label fs-5">Current List</label>
    <div class="input-group mb-3">
      <input
          :value="selectedListPath"
          type="text"
          :disabled="true"
          class="form-control"
      >
      <button
          class="btn btn-outline-secondary"
          type="button"
          id="btn-clear"
          @click="clearCurrentList"
      >Clear
      </button>
    </div>
  </div>
  <div class="mb-3" v-if="teams.length > 0">
    <label for="clickUpteamSelect" class="form-label fs-5">ClickUp Team</label>
    <select class="form-select" aria-label="ClickUp Team" id="clickUpTeamSelect"
            v-model="selectedTeam"
            @change="handleTeamSelect">
      <option v-for="team in teams" :key="team.id" :value="team">{{ team.name }}</option>
    </select>
  </div>
  <div class="mb-3" v-if="spaces.length > 0">
    <label for="clickUpSpaceSelect" class="form-label fs-5">ClickUp Space</label>
    <select class="form-select" aria-label="ClickUp Space" id="clickUpSpaceSelect"
            v-model="selectedSpace"
            @change="handleSpaceSelect"
    >
      <option v-for="space in spaces" :key="space.id" :value="space">{{ space.name }}</option>
    </select>
  </div>
  <div class="mb-3" v-if="folders.length > 0">
    <label for="clickUpFolderSelect" class="form-label fs-5">ClickUp Folder</label>
    <select class="form-select" aria-label="ClickUp Space" id="clickUpFolderSelect"
            v-model="selectedFolder"
            @change="handleFolderSelect"
    >
      <option v-for="folder in folders" :key="folder.id" :value="folder">{{ folder.name }}</option>
    </select>
  </div>
  <div v-if="folderlessLists.length > 0" class="mb-3">
    <label class="form-label fs-5">Folderless Lists in <strong>{{ selectedSpace?.name }}</strong> space</label>
    <ul class="list-group">
      <li
          class="list-group-item d-flex justify-content-between align-items-center"
          :class="{'list-group-item-primary': selectedList?.id === list?.id }"
          v-for="list in folderlessLists"
          :key="list.id">
        {{ list.name }}
        <button class="btn btn-sm btn-outline-primary" @click="selectList(list)"
                v-if="selectedList?.id !== list?.id">
          Select
        </button>
      </li>
    </ul>
  </div>
  <div v-if="lists.length > 0" class="mb-3">
    <label class="form-label fs-5">Lists in <strong>{{ selectedFolder?.name }}</strong> folder</label>
    <ul class="list-group">
      <li
          class="list-group-item d-flex justify-content-between align-items-center"
          :class="{'list-group-item-primary': selectedList?.id === list?.id }"
          v-for="list in lists"
          :key="list.id">
        {{ list.name }}
        <button class="btn btn-sm btn-outline-primary" @click="selectList(list)"
                v-if="selectedList?.id !== list?.id">
          Select
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {useClickUpStore} from "@/stores/clickup";
import {useLocalStore} from "@/stores/local";
import {computed, ref, watch} from "vue";
import type {Ref} from "vue"
import type {ClFolder, ClList, ClSpace, ClTeam} from "@/types";

const clickUp = useClickUpStore()
const teams = computed(() => clickUp.teamsOrdered)
const spaces = computed(() => clickUp.spacesOrdered)

const local = useLocalStore()

const stopWatchingApiKey = watch(() => local.clickUpApiToken, key => {
  if (key !== undefined && key !== null && key.length > 0) {
    clickUp.fetchTeams()
    stopWatchingApiKey()
  }
})
const selectedTeam: Ref<ClTeam | null> = ref(null)
const selectedSpace: Ref<ClSpace | null> = ref(null)
const selectedFolder: Ref<ClFolder | null> = ref(null)

const selectedList = computed(() => local.clickUpListToSaveJobs)
const selectedListPath = computed(() => {
  const space = selectedList.value?.space?.name ? selectedList.value?.space?.name + ' / ' : ""
  const folder = selectedList.value?.folder?.name ? selectedList.value?.folder?.name + ' / ' : ""
  return `${space}${folder}${selectedList.value?.name}`
})

const folders = computed(() => clickUp.foldersInSpace(selectedSpace.value?.id))
const lists = computed(() => clickUp.listsInFolder(selectedFolder.value?.id))
const folderlessLists = computed(() => clickUp.listsInSpace(selectedSpace.value?.id))

const handleTeamSelect = () => {
  if (selectedTeam.value) {
    selectedSpace.value = null
    clickUp.fetchSpaces(selectedTeam.value.id)
  }
}
const handleSpaceSelect = () => {
  if (selectedSpace.value) {
    selectedFolder.value = null
    clickUp.fetchFolders(selectedSpace.value.id)
    clickUp.fetchFolderlessLists(selectedSpace.value.id)
  }
}
const handleFolderSelect = () => {
  if (selectedFolder.value) {
    clickUp.fetchLists(selectedFolder.value.id)
  }
}

const selectList = (list: ClList) => {
  local.setClickUpListToSaveJobs(list)
}

const clearCurrentList = () => {
  local.setClickUpListToSaveJobs(undefined)
}

</script>

<style scoped>

</style>