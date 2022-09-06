import {createApp} from "vue";
import {createPinia} from "pinia";
import App from "./App.vue";

import "./assets/main.scss";
import {useLocalStore} from "@/stores/local";
import {storageGet, storageSet, storageSetKey} from "@/localStorage";
import type {LocalStore} from "@/types";
// @ts-ignore
import * as bootstrap from 'bootstrap'
import {library, config} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {
    faCalendarDays,
    faItalic,
    faSquareCheck,
    faHashtag,
    faLink,
    faXmark,
    faDollar
} from '@fortawesome/free-solid-svg-icons'


window.bootstrap = bootstrap

library.add(faCalendarDays, faItalic, faSquareCheck, faHashtag, faLink, faXmark, faDollar)

const app = createApp(App);

app.use(createPinia());
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount("#app");

const local = useLocalStore()

storageGet().then((state: LocalStore) => {
    // @ts-ignore
    local.$patch({
        // @ts-ignore
        clickUpApiToken: "",
        // @ts-ignore
        clickUpListToSaveJobs: null,
        // @ts-ignore
        availableFieldsInList: [],
        // @ts-ignore
        upworkJobsSentToClickUp: [],
        // @ts-ignore
        taskFieldMarkup: {},
        // @ts-ignore
        patched: true,
        ...state
    })
    local.$subscribe((mutation, state) => {
        storageSet(state)
    })
})

