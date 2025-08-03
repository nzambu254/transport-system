import type { BoardingStore } from '@/stores/boarding'

declare module '@/stores/boarding' {
  export const useBoardingStore: () => BoardingStore
}