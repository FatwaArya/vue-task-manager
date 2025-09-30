import axios from 'axios'

const runtimeBase = typeof window !== 'undefined' ? (window as any).__API_BASE__ : undefined
const baseURL = runtimeBase || (import.meta as any).env?.VITE_API_BASE || '/api'

const api = axios.create({ baseURL })

export default api


