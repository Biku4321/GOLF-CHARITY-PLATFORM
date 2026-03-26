import { create } from 'zustand'
import type { ReactNode } from 'react'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id:      string
  message: string
  variant: ToastVariant
}

interface UIState {
  toasts:       Toast[]
  sidebarOpen:  boolean
  modalOpen:    boolean
  modalContent: ReactNode | null

  addToast:    (message: string, variant?: ToastVariant) => void
  removeToast: (id: string) => void
  clearToasts: () => void

  setSidebarOpen: (open: boolean) => void
  toggleSidebar:  () => void

  openModal:  (content: ReactNode) => void
  closeModal: () => void
}

let toastCounter = 0

export const useUIStore = create<UIState>((set, get) => ({
  toasts:       [],
  sidebarOpen:  false,
  modalOpen:    false,
  modalContent: null,

  addToast: (message, variant = 'info') => {
    const id = String(++toastCounter)
    set(state => ({ toasts: [...state.toasts, { id, message, variant }] }))
    // Auto-dismiss after 4 s
    setTimeout(() => get().removeToast(id), 4000)
  },

  removeToast: (id) =>
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  clearToasts: () => set({ toasts: [] }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar:  ()     => set(state => ({ sidebarOpen: !state.sidebarOpen })),

  openModal:  (content) => set({ modalOpen: true,  modalContent: content }),
  closeModal: ()        => set({ modalOpen: false, modalContent: null }),
}))