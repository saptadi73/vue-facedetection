import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  title: string
  message?: string
  variant?: ToastVariant
  duration?: number
}

export interface ToastItem extends Required<Omit<ToastOptions, 'message'>> {
  id: number
  message?: string
}

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([])
  let nextId = 0
  const timers = new Map<number, ReturnType<typeof setTimeout>>()

  function remove(id: number) {
    const timer = timers.get(id)
    if (timer) clearTimeout(timer)
    timers.delete(id)
    items.value = items.value.filter((item) => item.id !== id)
  }

  function show(options: ToastOptions) {
    const item: ToastItem = {
      id: ++nextId,
      title: options.title,
      message: options.message,
      variant: options.variant ?? 'info',
      duration: options.duration ?? 4500,
    }
    items.value.push(item)
    if (item.duration > 0)
      timers.set(
        item.id,
        setTimeout(() => remove(item.id), item.duration),
      )
    return item.id
  }

  const success = (title: string, message?: string) => show({ title, message, variant: 'success' })
  const error = (title: string, message?: string) =>
    show({ title, message, variant: 'error', duration: 6500 })
  const warning = (title: string, message?: string) => show({ title, message, variant: 'warning' })
  const info = (title: string, message?: string) => show({ title, message, variant: 'info' })

  return { items, show, remove, success, error, warning, info }
})
