import { ensureSeed, withAuth, json, store } from '../_utils'

export default async function handler(request: Request) {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop() as string
    const authErr = withAuth(request)
    if (authErr) return authErr
    ensureSeed()

    if (request.method === 'PUT') {
        const body = await request.json().catch(() => ({}))
        const now = new Date().toISOString()
        const all = store.getAll()
        const idx = all.findIndex((t) => t.id === id)
        if (idx === -1) return json({ message: 'Task not found' }, 404)
        const updated = { ...all[idx], ...body, id, updatedAt: now }
        all[idx] = updated
        store.setAll(all)
        return json({ data: updated }, 200)
    }

    if (request.method === 'DELETE') {
        const all = store.getAll()
        const idx = all.findIndex((t) => t.id === id)
        if (idx === -1) return json({ message: 'Task not found' }, 404)
        const [removed] = all.splice(idx, 1)
        store.setAll(all)
        return json({ data: removed }, 200)
    }

    return json({ message: 'Method not allowed' }, 405)
}
