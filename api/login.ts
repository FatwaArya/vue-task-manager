import { json } from './_utils'

export default async function handler(request: Request) {
    if (request.method !== 'POST') return json({ message: 'Method not allowed' }, 405)
    const { email, password } = await request.json().catch(() => ({}))
    if (!email || !password) return json({ message: 'Email and password are required' })
    return json({ token: 'mock-token-123', user: { id: 1, email } }, 200)
}
