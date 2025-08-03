// composables/useBoardingQueue.ts
import { ref, type Ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { PriorityQueue, PassengerPriority, createPassengerQueue } from '~/utils/PriorityQueue'

interface DatabasePassenger {
  id: string
  vehicle_id: string
  passenger_name: string
  passenger_type: PassengerPriority['type']
  arrival_time: string
  boarding_time: string | null
  seat_preference: string | null
  status: NonNullable<PassengerPriority['status']>
  queue_position: number | null
}

interface BoardingQueueReturn {
  queue: PriorityQueue<PassengerPriority>
  loading: Ref<boolean>
  error: Ref<string | null>
  fetchPassengers: (vehicleId: string) => Promise<void>
  addPassenger: (passenger: Omit<PassengerPriority, 'id' | 'queuePosition' | 'status'>) => Promise<DatabasePassenger | null>
  boardPassenger: (passengerId: string) => Promise<DatabasePassenger | null>
}

export const useBoardingQueue = (): BoardingQueueReturn => {
  const supabase = useSupabaseClient()
  const queue = createPassengerQueue()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPassengers = async (vehicleId: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('passenger_queue')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('arrival_time', { ascending: true })

      if (fetchError) throw fetchError

      queue.clear()

      data?.forEach((passenger: DatabasePassenger) => {
        queue.enqueue({
          id: passenger.id,
          vehicleId: passenger.vehicle_id,
          name: passenger.passenger_name,
          type: passenger.passenger_type,
          arrivalTime: new Date(passenger.arrival_time),
          boardingTime: passenger.boarding_time ? new Date(passenger.boarding_time) : undefined,
          seatPreference: passenger.seat_preference || undefined,
          status: passenger.status || 'waiting',
          queuePosition: passenger.queue_position || 0
        })
      })
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  const addPassenger = async (passenger: Omit<PassengerPriority, 'id' | 'queuePosition' | 'status'>): Promise<DatabasePassenger | null> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('passenger_queue')
        .insert({
          vehicle_id: passenger.vehicleId,
          passenger_name: passenger.name,
          passenger_type: passenger.type,
          arrival_time: passenger.arrivalTime.toISOString(),
          seat_preference: passenger.seatPreference,
          status: 'waiting',
          queue_position: queue.size() + 1
        })
        .select()
        .single()

      if (insertError) throw insertError

      const passengerWithId: PassengerPriority = {
        ...passenger,
        id: data.id,
        queuePosition: queue.size() + 1,
        status: 'waiting',
        boardingTime: undefined
      }

      queue.enqueue(passengerWithId)
      return data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  const boardPassenger = async (passengerId: string): Promise<DatabasePassenger | null> => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('passenger_queue')
        .update({
          status: 'boarding',
          boarding_time: new Date().toISOString()
        })
        .eq('id', passengerId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local queue state
      const passengers = queue.toArray()
      const index = passengers.findIndex(p => p.id === passengerId)
      if (index !== -1) {
        passengers[index] = {
          ...passengers[index],
          status: 'boarding',
          boardingTime: new Date()
        }
        queue.clear()
        passengers.forEach(p => queue.enqueue(p))
      }

      return data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    queue,
    loading,
    error,
    fetchPassengers,
    addPassenger,
    boardPassenger
  }
}