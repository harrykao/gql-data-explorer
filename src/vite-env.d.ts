/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CONFIG_FILE: string;
    readonly VITE_GQL_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
