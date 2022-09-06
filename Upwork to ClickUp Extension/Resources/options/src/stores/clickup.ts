import {defineStore} from "pinia";
import type {ClFolder, ClList, ClSpace, ClTeam} from "@/types";
import apiClient from "@/apiClient";
import {computed, ref} from "vue";
import type {Ref} from "vue";
import {useLocalStore} from "@/stores/local";
import {convertArrayToObject} from "@/utils";

export const useClickUpStore = defineStore('clickUp', () => {
    const localStore = useLocalStore()

    const teams: Ref<{ [key: string]: ClTeam }> = ref({})
    const teamsIndex: Ref<string[]> = ref([])
    const teamsOrdered = computed(() => teamsIndex.value.map(id => teams.value[id]))

    const spaces: Ref<{ [key: string]: ClSpace }> = ref({})
    const spacesIndex: Ref<string[]> = ref([])
    const spacesOrdered = computed(() => spacesIndex.value.map(id => spaces.value[id]))

    const folders: Ref<{ [key: string]: ClFolder }> = ref({})
    const foldersIndex: Ref<string[]> = ref([])
    const foldersOrdered = computed(() => foldersIndex.value.map(id => folders.value[id]))
    const foldersInSpace = computed(
        () => (spaceId?: string) => spaceId ? foldersOrdered.value.filter((folder: ClFolder) => folder.spaceId === spaceId) : []
    )

    const lists: Ref<{ [key: string]: ClList }> = ref({})
    const listsIndex: Ref<string[]> = ref([])
    const listsOrdered = computed(() => listsIndex.value.map(id => lists.value[id]))
    const listsInSpace = computed(
        () => (spaceId?: string) => spaceId ? listsOrdered.value.filter((list: ClList) => list.spaceId === spaceId) : []
    )
    const listsInFolder = computed(
        () => (folderId?: string) => folderId ? listsOrdered.value.filter((list: ClList) => list.folderId === folderId) : []
    )


    function fetchTeams() {
        return apiClient(localStore.clickUpApiToken)
            .get('team')
            .then((clTeams: any) => {
                teamsIndex.value.push(...clTeams.teams.map((team: any) => team.id + ""))
                teams.value = convertArrayToObject(
                    clTeams.teams.map((team: any) => ({id: team.id, name: team.name})),
                    'id'
                )
            })
    }

    function fetchSpaces(teamId: string) {
        return apiClient(localStore.clickUpApiToken)
            .get(`team/${teamId}/space?archived=false`)
            .then((clSpaces: any) => {
                spacesIndex.value.push(...clSpaces.spaces.map((space: any) => space.id + ""))
                spaces.value = convertArrayToObject(
                    clSpaces.spaces.map((space: any) => ({id: space.id, name: space.name})),
                    'id'
                )
            })
    }

    function fetchFolders(spaceId: string) {
        return apiClient(localStore.clickUpApiToken)
            .get(`space/${spaceId}/folder?archived=false`)
            .then((clFolders: any) => {
                foldersIndex.value.push(...clFolders.folders.map((folder: any) => folder.id + ""))
                folders.value = {
                    ...folders.value,
                    ...convertArrayToObject(
                        clFolders.folders.map((folder: any) => ({
                            id: folder.id,
                            name: folder.name,
                            spaceId: folder.space.id
                        })),
                        'id'
                    )
                }
            })
    }

    function fetchLists(folderId: string) {
        return apiClient(localStore.clickUpApiToken)
            .get(`folder/${folderId}/list?archived=false`)
            .then((clLists: any) => {
                listsIndex.value.push(...clLists.lists.map((list: any) => list.id + ""))
                lists.value = {
                    ...lists.value,
                    ...convertArrayToObject(
                        clLists.lists.map((list: any) => ({
                            id: list.id,
                            name: list.name,
                            folderId: list.folder.id,
                            space: spaces.value[list?.space?.id],
                            folder: folders.value[list?.folder?.id],
                        })),
                        'id'
                    )
                }
            })
    }

    function fetchFolderlessLists(spaceId: string) {
        return apiClient(localStore.clickUpApiToken)
            .get(`space/${spaceId}/list?archived=false`)
            .then((clLists: any) => {
                listsIndex.value.push(...clLists.lists.map((list: any) => list.id + ""))
                lists.value = {
                    ...lists.value,
                    ...convertArrayToObject(
                        clLists.lists.map((list: any) => ({
                            id: list.id,
                            name: list.name,
                            spaceId: list.space.id,
                            space: spaces.value[list?.space?.id],
                            folder: folders.value[list?.folder?.id],
                        })),
                        'id'
                    )
                }
            })
    }

    return {
        teams,
        spaces,
        folders,
        lists,

        teamsOrdered,
        spacesOrdered,
        foldersOrdered,
        foldersInSpace,
        listsOrdered,
        listsInSpace,
        listsInFolder,

        fetchTeams,
        fetchSpaces,
        fetchFolders,
        fetchLists,
        fetchFolderlessLists,
    }
})
