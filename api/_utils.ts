export type Task = {
    id: string
    title: string
    description?: string
    status: 'todo' | 'in_progress' | 'done'
    priority?: 'low' | 'medium' | 'high'
    dueDate?: string | null
    createdAt: string
    updatedAt: string
}

let tasks: Task[] = []
let nextId = 1

export function ensureSeed() {
    if (tasks.length > 0) return
    const now = new Date()
    const add = (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
        const id = String(nextId++)
        const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 7) * 86400000).toISOString()
        const updatedAt = createdAt
        tasks.push({ id, createdAt, updatedAt, ...t })
    }
    add({ title: 'Set up project repo', description: 'Initialize repository and CI', status: 'done', priority: 'medium', dueDate: null })
    add({ title: 'Design login UI', description: 'PrimeVue sleek form', status: 'in_progress', priority: 'high', dueDate: new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10) })
    add({ title: 'Implement tasks CRUD', description: 'API wiring and table', status: 'todo', priority: 'high', dueDate: new Date(now.getTime() + 5 * 86400000).toISOString().slice(0, 10) })
}

export function withAuth(request: Request): Response | null {
    const auth = request.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) {
        return json({ message: 'Unauthorized' }, 200)
    }
    const token = auth.slice('Bearer '.length)
    if (token !== 'mock-token-123') {
        return json({ message: 'Invalid token' }, 200)
    }
    return null
}

export function applyFilters(data: Task[], url: URL) {
    let result = [...data]
    const search = url.searchParams.get('search')
    const status = url.searchParams.get('status')
    if (search) {
        const s = String(search).toLowerCase()
        result = result.filter((t) => t.title.toLowerCase().includes(s) || (t.description || '').toLowerCase().includes(s))
    }
    if (status) {
        const statuses = String(status).split(',')
        result = result.filter((t) => statuses.includes(t.status))
    }
    return result
}

export function applySort(data: Task[], url: URL) {
    const sortBy = (url.searchParams.get('sortBy') as keyof Task) || 'createdAt'
    const sortDir = (url.searchParams.get('sortDir') || 'desc').toLowerCase() === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
        const av = (a as any)[sortBy]
        const bv = (b as any)[sortBy]
        if (av === bv) return 0
        return av > bv ? sortDir : -1 * sortDir
    })
}

export function applyPagination(data: Task[], url: URL) {
    const page = Math.max(1, parseInt(String(url.searchParams.get('page') || '1'), 10))
    const limit = Math.max(1, Math.min(100, parseInt(String(url.searchParams.get('limit') || '10'), 10)))
    const total = data.length
    const pageCount = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    const end = start + limit
    return {
        items: data.slice(start, end),
        meta: { page, limit, total, pageCount, hasNext: page < pageCount, hasPrev: page > 1 },
    }
}

export function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

export const store = {
    getAll: () => tasks,
    setAll: (next: Task[]) => { tasks = next },
    nextId: () => String(nextId++),
}


