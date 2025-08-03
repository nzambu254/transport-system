// types/index.d.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PriorityQueue, PassengerPriority } from '~/utils/PriorityQueue'

// Global type declarations
declare global {
  // Nuxt auto-imports
  declare module '#imports' {
    export const useSupabaseClient: () => SupabaseClient
  }

  // Composable types
  declare module '~/composables/useBoardingQueue' {
    export function useBoardingQueue(): {
      queue: PriorityQueue<PassengerPriority>
      loading: Ref<boolean>
      error: Ref<string | null>
      fetchPassengers: (vehicleId: string) => Promise<void>
      addPassenger: (
        passenger: Omit<PassengerPriority, 'id' | 'queuePosition' | 'status'>
      ) => Promise<PassengerPriority | null>
      boardPassenger: (passengerId: string) => Promise<void>
    }
  }

  // Database types
  interface DatabasePassenger {
    id: string
    vehicle_id: string
    passenger_name: string
    passenger_type: PassengerPriority['type']
    arrival_time: string
    boarding_time: string | null
    seat_preference: string | null
    status: PassengerPriority['status']
    queue_position: number | null
  }

  interface SupabasePayload {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new: DatabasePassenger
    old?: { id: string }
  }
}

// Ensure this file is treated as a module
export { }