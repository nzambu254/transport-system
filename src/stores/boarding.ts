// src/stores/boarding.ts
import { ref, computed, ComputedRef, Ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { defineStore } from 'pinia'
import { useBoardingQueue } from '~/composables/useBoardingQueue'
import type { PassengerPriority } from '~/utils/PriorityQueue'

type SupabasePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: {
    id: string
    vehicle_id: string
    passenger_name: string
    passenger_type: string
    arrival_time: string
    boarding_time?: string | null
    seat_preference?: string
    status?: string
    queue_position?: number
  }
  old?: {
    [key: string]: any
  }
}

export const useBoardingStore = defineStore('boarding', () => {
  const { queue, loading, error, fetchPassengers, addPassenger, boardPassenger } = useBoardingQueue()
  const currentVehicle = ref<string | null>(null)

  const passengers = computed(() => queue.toArray())
  const nextPassenger = computed(() => queue.peek())

  const setVehicle = async (vehicleId: string) => {
    currentVehicle.value = vehicleId
    await fetchPassengers(vehicleId)
    subscribeToUpdates()
  }

  const subscribeToUpdates = () => {
    if (!currentVehicle.value) return

    const supabase = useSupabaseClient()

    const channel = supabase
      .channel('passenger_queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'passenger_queue',
          filter: `vehicle_id=eq.${currentVehicle.value}`
        },
        (payload: unknown) => {
          const typedPayload = payload as SupabasePayload
          if (typedPayload.eventType === 'INSERT') {
            const newPassenger: PassengerPriority = {
              id: typedPayload.new.id,
              vehicleId: typedPayload.new.vehicle_id,
              name: typedPayload.new.passenger_name,
              type: typedPayload.new.passenger_type as PassengerPriority['type'],
              arrivalTime: new Date(typedPayload.new.arrival_time),
              boardingTime: typedPayload.new.boarding_time ? new Date(typedPayload.new.boarding_time) : undefined,
              seatPreference: typedPayload.new.seat_preference,
              status: typedPayload.new.status as PassengerPriority['status'],
              queuePosition: typedPayload.new.queue_position || 0
            }
            queue.enqueue(newPassenger)
          } else if (typedPayload.eventType === 'UPDATE') {
            const updatedPassenger: PassengerPriority = {
              id: typedPayload.new.id,
              vehicleId: typedPayload.new.vehicle_id,
              name: typedPayload.new.passenger_name,
              type: typedPayload.new.passenger_type as PassengerPriority['type'],
              arrivalTime: new Date(typedPayload.new.arrival_time),
              boardingTime: typedPayload.new.boarding_time ? new Date(typedPayload.new.boarding_time) : undefined,
              seatPreference: typedPayload.new.seat_preference,
              status: typedPayload.new.status as PassengerPriority['status'],
              queuePosition: typedPayload.new.queue_position || 0
            }

            const passengers = queue.toArray()
            const index = passengers.findIndex((p: PassengerPriority) => p.id === updatedPassenger.id)
            if (index !== -1) {
              passengers[index] = updatedPassenger
              queue.clear()
              passengers.forEach((p: PassengerPriority) => queue.enqueue(p))
            }
          } else if (typedPayload.eventType === 'DELETE') {
            const passengers = queue.toArray()
            const updatedPassengers = passengers.filter((p: PassengerPriority) => p.id !== typedPayload.old?.id)
            queue.clear()
            updatedPassengers.forEach((p: PassengerPriority) => queue.enqueue(p))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    currentVehicle,
    passengers,
    nextPassenger,
    loading,
    error,
    setVehicle,
    addPassenger,
    boardPassenger,
    subscribeToUpdates
  }
})

// Type declaration for the store
export interface BoardingStore {
  currentVehicle: Ref<string | null>
  passengers: ComputedRef<PassengerPriority[]>
  nextPassenger: ComputedRef<PassengerPriority | undefined>
  loading: Ref<boolean>
  error: Ref<Error | null>
  setVehicle: (vehicleId: string) => Promise<void>
  addPassenger: (passenger: Omit<PassengerPriority, 'id'>) => Promise<void>
  boardPassenger: (passengerId: string) => Promise<void>
  subscribeToUpdates: () => () => void
}