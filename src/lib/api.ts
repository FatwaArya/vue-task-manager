import axios from 'axios'

const baseURL = (import.meta as any).env?.VITE_API_BASE || '/api'

const api = axios.create({ baseURL })

export default api


