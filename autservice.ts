import { ref, computed } from 'vue'
import type { User, UserRole } from '@/types'
import { apiAuth, setToken, clearToken } from './apiService'
import { getUserByEmail, getUserByPhone, createUser, getUsers } from './db'

const AUTH_KEY = 'agrimarket_session'
const saved = localStorage.getItem(AUTH_KEY)
const currentUser = ref<User | null>(saved ? JSON.parse(saved) : null)

function persist(): void {
  if (currentUser.value) localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser.value))
  else localStorage.removeItem(AUTH_KEY)
}

export function useAuth() {
  const user = computed(() => currentUser.value)
  const isLoggedIn = computed(() => !!currentUser.value)
  const role = computed(() => currentUser.value?.role || null)
  const isPetani = computed(() => role.value === 'petani')
  const isPembeli = computed(() => role.value === 'pembeli')
  const isAdmin = computed(() => role.value === 'admin')
  const userId = computed(() => currentUser.value?.id || '')

  function localLogin(credential: string, password: string): { success: boolean; error?: string; user?: User } {
    const user = getUserByEmail(credential) || getUserByPhone(credential)
    if (!user) return { success: false, error: 'Akun tidak ditemukan' }
    if (user.password !== password) return { success: false, error: 'Password salah' }
    return { success: true, user }
  }

  async function login(credential: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const data = await apiAuth.login(credential, password)
      setToken(data.token)
      currentUser.value = data.user
      persist()
      return { success: true }
    } catch (e: any) {
      const fallback = localLogin(credential, password)
      if (fallback.success && fallback.user) {
        currentUser.value = fallback.user
        persist()
        return { success: true }
      }
      return { success: false, error: e.message || fallback.error || 'Login gagal' }
    }
  }

  async function register(data: { name: string; email: string; phone: string; password: string; role: UserRole; location: string }): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await apiAuth.register(data)
      setToken(result.token)
      currentUser.value = result.user as any
      persist()
      return { success: true }
    } catch (e: any) {
      if (getUserByEmail(data.email)) return { success: false, error: 'Email sudah terdaftar' }
      if (data.phone && getUserByPhone(data.phone)) return { success: false, error: 'Nomor HP sudah terdaftar' }
      const newUser = createUser(data)
      currentUser.value = newUser
      persist()
      return { success: true }
    }
  }

  function logout(): void {
    currentUser.value = null
    clearToken()
    persist()
  }

  async function updateProfile(data: Partial<User>): Promise<void> {
    try {
      const updated = await apiAuth.updateProfile(data as any)
      currentUser.value = updated
      persist()
    } catch (e) {
      if (currentUser.value) {
        Object.assign(currentUser.value, data)
        persist()
      }
    }
  }

  async function changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiAuth.changePassword(oldPassword, newPassword)
      return { success: true }
    } catch (e: any) {
      if (currentUser.value?.password === oldPassword) {
        if (currentUser.value) currentUser.value.password = newPassword
        persist()
        return { success: true }
      }
      return { success: false, error: e.message || 'Password lama salah' }
    }
  }

  return { user, isLoggedIn, role, isPetani, isPembeli, isAdmin, userId, login, register, logout, updateProfile, changePassword }
}
