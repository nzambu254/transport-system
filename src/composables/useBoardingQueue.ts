import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { createPassengerQueue, type PassengerPriority } from '~/utils/PriorityQueue'

interface DatabasePassenger {
  id: string
  vehicle_id: string
  passenger_name: string
  passenger_type: 'vip' | 'elderly' | 'regular' | 'standby'
  arrival_time: string
  boarding_time?: string | null
  seat_preference?: string | null
  status: 'waiting' | 'boarding' | 'boarded'
  queue_position?: number | null
}

export const useBoardingQueue = () => {
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
          seatPreference: passenger.seat_preference ?? undefined,
          status: passenger.status,
          queuePosition: passenger.queue_position ?? queue.size() + 1
        })
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch passengers'
    } finally {
      loading.value = false
    }
  }

  const addPassenger = async (
    passenger: Omit<PassengerPriority, 'id' | 'queuePosition' | 'status'>
  ) => {
    try {
      loading.value = true
      error.value = null

      const queuePos = queue.size() + 1

      const { data, error: insertError } = await supabase
        .from('passenger_queue')
        .insert({
          vehicle_id: passenger.vehicleId,
          passenger_name: passenger.name,
          passenger_type: passenger.type,
          arrival_time: passenger.arrivalTime.toISOString(),
          seat_preference: passenger.seatPreference,
          status: 'waiting',
          queue_position: queuePos
        })
        .select()
        .single()

      if (insertError) throw insertError

      const newPassenger: PassengerPriority = {
        ...passenger,
        id: data.id,
        status: 'waiting',
        queuePosition: queuePos
      }

      queue.enqueue(newPassenger)
      return data.id
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add passenger'
      return null
    } finally {
      loading.value = false
    }
  }

  const boardPassenger = async (passengerId: string) => {
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

      // FIX: Use traditional approach - find index then update
      const index = queue.findIndex((p: PassengerPriority) => p.id === passengerId)
      if (index !== -1) {
        queue.update(index, {
          status: 'boarding' as const,
          boardingTime: new Date()
        })
      }

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to board passenger'
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