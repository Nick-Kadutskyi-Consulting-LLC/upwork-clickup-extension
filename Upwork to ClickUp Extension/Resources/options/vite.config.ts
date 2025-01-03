import {fileURLToPath, URL} from "node:url";

import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import {resolve} from "path";
import vitePluginRequire from "vite-plugin-require";


const config = {
    options: {
        "build.rollupOptions.input": {
            index: resolve(__dirname, './index.html')
        },
        "build.outDir": "../preferences"
    },
    background: {
        "build.rollupOptions.input": {
            index: resolve(__dirname, './src/background.ts')
        },
        "build.outDir": "../background"
    },
    content: {
        "build.rollupOptions.input": {
            index: resolve(__dirname, './src/content.ts'),
        },
        "build.outDir": "../content"
    }
};

// @ts-ignore
const currentConfig = config[process.env.LIB_NAME || "options"];

if (currentConfig === undefined) {
    throw new Error('LIB_NAME is not defined or is not valid');
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({reactivityTransform: true}),
        vueJsx(),
        vitePluginRequire({
            // @fileRegex RegExp
            // optional：default file processing rules are as follows
            fileRegex: /(.ts?)$/
        })
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    base: "",
    build: {
        rollupOptions: {
            input: {
                ...currentConfig["build.rollupOptions.input"]
            },
            output: {
                entryFileNames: (chunkInfo) => chunkInfo.name + ".js",
            }
        },
        outDir: currentConfig["build.outDir"],
    },
    assetsInclude: ['**/*.woff', '**/*.woff2']
});
