import { defineStore } from 'pinia'

export const useBoardingQueueStore = defineStore('boardingQueue', {
  state: () => ({
    passengers: [] as any[],
    loading: false,
  }),
})