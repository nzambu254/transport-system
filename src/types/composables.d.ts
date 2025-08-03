// src/types/composables.d.ts
import type { BoardingQueueReturn } from '@/composables/useBoardingQueue'

declare module '@/composables/useBoardingQueue' {
  export const useBoardingQueue: () => BoardingQueueReturn
}