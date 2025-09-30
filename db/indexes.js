// MongoDB index suggestions based on query patterns used by the app
// Run these in a Mongo shell or migration tool in a real project

/**
 * Queries we support:
 * - Filter by status (often multi-value) and search by title/description
 * - Sort by createdAt, title, priority, dueDate
 */

// Compound index to support common filtering and sorting
// db.tasks.createIndex({ status: 1, createdAt: -1 })

// For text-like search on title/description (basic)
// db.tasks.createIndex({ title: 'text', description: 'text' })

// If frequently sorting by dueDate with status filter
// db.tasks.createIndex({ status: 1, dueDate: 1 })

// If frequently sorting by priority with status filter
// db.tasks.createIndex({ status: 1, priority: 1 })

// If frequently sorting by title with status filter
// db.tasks.createIndex({ status: 1, title: 1 })


