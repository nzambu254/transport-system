// src/types/imports.d.ts
declare module '#imports' {
  import { SupabaseClient } from '@supabase/supabase-js'
  export const useSupabaseClient: () => SupabaseClient
}

declare module '~/composables/useBoardingQueue' {
  import type { PriorityQueue, PassengerPriority } from '~/utils/PriorityQueue'

  export function useBoardingQueue(): {
    queue: PriorityQueue<PassengerPriority>
    loading: Ref<boolean>
    error: Ref<string | null>
    fetchPassengers: (vehicleId: string) => Promise<void>
    addPassenger: (passenger: Omit<PassengerPriority, 'id' | 'queuePosition' | 'status'>) => Promise<any>
    boardPassenger: (passengerId: string) => Promise<any>
  }
}