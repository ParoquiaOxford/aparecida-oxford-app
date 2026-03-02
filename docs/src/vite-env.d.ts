/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL?: string
	readonly VITE_API_BASE_URL_DEV?: string
	readonly VITE_API_BASE_URL_PRD?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
