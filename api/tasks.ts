import { ensureSeed, withAuth, applyFilters, applySort, applyPagination, json, store } from './_utils'

export default async function handler(request: Request) {
    const url = new URL(request.url)
    const method = request.method
    const authErr = withAuth(request)
    if (authErr) return authErr
    ensureSeed()

    if (method === 'GET') {
        const filtered = applyFilters(store.getAll(), url)
        const sorted = applySort(filtered, url)
        const { items, meta } = applyPagination(sorted, url)
        return json({ data: items, meta }, 200)
    }

    if (method === 'POST') {
        const body = await request.json().catch(() => ({}))
        const { title, description = '', status = 'todo', dueDate = null, priority = 'medium' } = body
        if (!title) return json({ message: 'Title is required' }, 400)
        const now = new Date().toISOString()
        const task = { id: store.nextId(), title, description, status, dueDate, priority, createdAt: now, updatedAt: now }
        const all = store.getAll()
        store.setAll([...all, task])
        return json({ data: task }, 201)
    }

    return json({ message: 'Method not allowed' }, 405)
}
