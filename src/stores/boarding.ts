// src/stores/boarding.ts
import { defineStore } from 'pinia'

export const useBoardingStore = defineStore('boarding', {
  state: () => ({
    passengers: [] as any[],
    loading: false,
    currentVehicle: ''
  }),
  actions: {
    async addPassenger(passenger: {
      name: string
      type: string
      seatPreference: string
      arrivalTime: Date
      vehicleId: string
    }) {
      this.loading = true
      try {
        // Simulate API call or push to local array
        this.passengers.push(passenger)
      } finally {
        this.loading = false
      }
    }
  }
})
