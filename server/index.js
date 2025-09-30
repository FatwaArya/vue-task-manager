import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// In-memory mock data
let tasks = []
let nextId = 1

function seedTasks() {
    if (tasks.length > 0) return
    const now = new Date()
    const add = (t) => {
        const id = String(nextId++)
        const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 7) * 86400000).toISOString()
        const updatedAt = createdAt
        tasks.push({ id, createdAt, updatedAt, ...t })
    }
    add({ title: 'Set up project repo', description: 'Initialize repository and CI', status: 'done', priority: 'medium', dueDate: null })
    add({ title: 'Design login UI', description: 'PrimeVue sleek form', status: 'in_progress', priority: 'high', dueDate: new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10) })
    add({ title: 'Implement tasks CRUD', description: 'API wiring and table', status: 'todo', priority: 'high', dueDate: new Date(now.getTime() + 5 * 86400000).toISOString().slice(0, 10) })
    add({ title: 'Write README', description: 'Usage instructions', status: 'todo', priority: 'low', dueDate: null })
}

// Helpers: filtering, sorting, pagination
function applyFilters(data, query) {
    let result = [...data]
    const { search, status } = query
    if (search) {
        const s = String(search).toLowerCase()
        result = result.filter((t) =>
            t.title.toLowerCase().includes(s) || (t.description || '').toLowerCase().includes(s)
        )
    }
    if (status) {
        const statuses = String(status).split(',')
        result = result.filter((t) => statuses.includes(t.status))
    }
    return result
}

function applySort(data, query) {
    const sortBy = query.sortBy || 'createdAt'
    const sortDir = (query.sortDir || 'desc').toLowerCase() === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
        const av = a[sortBy]
        const bv = b[sortBy]
        if (av === bv) return 0
        return av > bv ? sortDir : -1 * sortDir
    })
}

function applyPagination(data, query) {
    const page = Math.max(1, parseInt(String(query.page || '1'), 10))
    const limit = Math.max(1, Math.min(100, parseInt(String(query.limit || '10'), 10)))
    const total = data.length
    const pageCount = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    const end = start + limit
    return {
        items: data.slice(start, end),
        meta: { page, limit, total, pageCount, hasNext: page < pageCount, hasPrev: page > 1 },
    }
}

// Auth middleware (mock)
function requireAuth(req, res, next) {
    const auth = req.headers.authorization || ''
    if (!auth.startsWith('Bearer ')) {
        return res.json({ message: 'Unauthorized' })
    }
    const token = auth.slice('Bearer '.length)
    if (token !== 'mock-token-123') {
        return res.json({ message: 'Invalid token' })
    }
    next()
}

// Routes
app.post('/login', (req, res) => {
    const { email, password } = req.body || {}
    if (!email || !password) {
        return res.json({ message: 'Email and password are required' })
    }
    // Always succeed for mock
    return res.status(200).json({ token: 'mock-token-123', user: { id: 1, email } })
})

app.get('/tasks', requireAuth, (req, res) => {
    const filtered = applyFilters(tasks, req.query)
    const sorted = applySort(filtered, req.query)
    const { items, meta } = applyPagination(sorted, req.query)
    return res.status(200).json({ data: items, meta })
})

app.post('/tasks', requireAuth, (req, res) => {
    const { title, description = '', status = 'todo', dueDate = null, priority = 'medium' } = req.body || {}
    if (!title) return res.status(400).json({ message: 'Title is required' })
    const now = new Date().toISOString()
    const task = { id: String(nextId++), title, description, status, dueDate, priority, createdAt: now, updatedAt: now }
    tasks.push(task)
    return res.status(201).json({ data: task })
})

app.put('/tasks/:id', requireAuth, (req, res) => {
    const id = String(req.params.id)
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx === -1) return res.status(404).json({ message: 'Task not found' })
    const now = new Date().toISOString()
    tasks[idx] = { ...tasks[idx], ...req.body, id, updatedAt: now }
    return res.status(200).json({ data: tasks[idx] })
})

app.delete('/tasks/:id', requireAuth, (req, res) => {
    const id = String(req.params.id)
    const idx = tasks.findIndex((t) => t.id === id)
    if (idx === -1) return res.status(404).json({ message: 'Task not found' })
    const [removed] = tasks.splice(idx, 1)
    return res.status(200).json({ data: removed })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    seedTasks()
    console.log(`Mock API listening on http://localhost:${PORT}`)
})


