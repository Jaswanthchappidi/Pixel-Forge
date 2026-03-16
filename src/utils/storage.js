// ─── Storage Utility ─────────────────────────────────────────────────────────
// Uses IndexedDB for large image blobs, localStorage for metadata/settings.
// ─────────────────────────────────────────────────────────────────────────────

import { openDB } from 'idb'

const DB_NAME   = 'pixelforge-db'
const DB_VER    = 1
const STORE     = 'images'

// Open / init the DB
export async function getDB() {
  return openDB(DB_NAME, DB_VER, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
        store.createIndex('createdAt', 'createdAt')
      }
    },
  })
}

// Save a processed image blob
export async function saveImage(blob, meta = {}) {
  const db = await getDB()
  const id = await db.add(STORE, {
    blob,
    name:       meta.name       || 'image',
    format:     meta.format     || 'png',
    size:       blob.size,
    createdAt:  Date.now(),
    ...meta,
  })
  return id
}

// Load all saved images
export async function getAllImages() {
  const db = await getDB()
  return db.getAll(STORE)
}

// Delete one image
export async function deleteImage(id) {
  const db = await getDB()
  return db.delete(STORE, id)
}

// ─── Daily Limit (localStorage) ──────────────────────────────────────────────

const LIMIT_KEY    = 'pf_daily_usage'
const DAILY_MAX    = 20   // conversions / edits per day

function getTodayKey() {
  return new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
}

export function getDailyUsage() {
  const raw = localStorage.getItem(LIMIT_KEY)
  if (!raw) return { date: getTodayKey(), count: 0 }
  try {
    const data = JSON.parse(raw)
    if (data.date !== getTodayKey()) return { date: getTodayKey(), count: 0 }
    return data
  } catch {
    return { date: getTodayKey(), count: 0 }
  }
}

export function incrementDailyUsage() {
  const usage = getDailyUsage()
  usage.count += 1
  localStorage.setItem(LIMIT_KEY, JSON.stringify(usage))
  return usage
}

export function isLimitReached() {
  const { count } = getDailyUsage()
  return count >= DAILY_MAX
}

export function getDailyMax() { return DAILY_MAX }

// ─── App Settings (localStorage) ─────────────────────────────────────────────

const SETTINGS_KEY = 'pf_settings'

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
  } catch {
    return {}
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}