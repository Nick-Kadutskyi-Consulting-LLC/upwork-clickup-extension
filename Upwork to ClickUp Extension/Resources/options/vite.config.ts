import {fileURLToPath, URL} from "node:url";

import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import {resolve} from "path";
import vitePluginRequire from "vite-plugin-require";


const config = {
    other: {
        index: resolve(__dirname, './index.html'),
        background: resolve(__dirname, './background.html'),
    },
    content: {
        content: resolve(__dirname, './src/content.ts'),
    },
};

const currentConfig = config[process.env.LIB_NAME || "other"];

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
        emptyOutDir: false,
        rollupOptions: {
            input: {
                ...currentConfig
            },
            output: {
                entryFileNames: (chunkInfo) => chunkInfo.name + ".js",
            }
        }
    },
    assetsInclude: ['**/*.woff', '**/*.woff2']
});
