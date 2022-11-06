import { useEventBus, type EventBusKey } from '@vueuse/core'

export const accessoriesBusKey: EventBusKey<'add' | 'deleteSelected'> = Symbol('accessories')
export const accessoriesEventBus = useEventBus<'add' | 'deleteSelected', string>(accessoriesBusKey)
