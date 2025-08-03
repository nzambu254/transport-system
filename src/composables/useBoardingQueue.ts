import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'
import { createClient } from '@supabase/supabase-js'
import { PriorityQueue, PassengerPriority, createPassengerQueue, passengerComparator } from '~/utils/priorityQueue' // lowercase 'p'

interface SeatAssignment {
  seatNumber: string
  passengerId: string
}

export const useBoardingQueue = (vehicleId: string) => {
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
  )

  // State
  const queue = ref<PriorityQueue<PassengerPriority>>(createPassengerQueue())
  const passengers = ref<PassengerPriority[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const seatAssignments = ref<SeatAssignment[]>([])
  const totalSeats = ref<number>(50) // Default vehicle capacity

  // Realtime subscription
  let subscription: any = null

  // Computed
  const queueSize = computed(() => queue.value.size())
  const isEmpty = computed(() => queue.value.isEmpty())
  const nextPassenger = computed(() => queue.value.peek())

  const passengersByType = computed(() => {
    const grouped = passengers.value.reduce(
      (acc: Record<string, PassengerPriority[]>, passenger: PassengerPriority) => {
        if (!acc[passenger.type]) acc[passenger.type] = []
        acc[passenger.type].push(passenger)
        return acc
      },
      {} as Record<string, PassengerPriority[]>
    )

    return {
      vip: grouped.vip || [],
      elderly: grouped.elderly || [],
      regular: grouped.regular || [],
      standby: grouped.standby || []
    }
  })

  const availableSeats = computed(() => {
    const assignedSeats = seatAssignments.value.map(a => a.seatNumber)
    const allSeats = Array.from(
      { length: totalSeats.value },
      (_, i) => `${Math.floor(i / 4) + 1}${String.fromCharCode(65 + (i % 4))}`
    )
    return allSeats.filter(seat => !assignedSeats.includes(seat))
  })

  // Load passengers from database
  const loadPassengers = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('passenger_queue')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .eq('status', 'waiting')
        .order('arrival_time', { ascending: true })

      if (fetchError) throw fetchError

      // Clear and rebuild queue
      queue.value.clear()
      passengers.value = []

      data.forEach((passenger: any) => {
        const passengerData: PassengerPriority = {
          id: passenger.id,
          name: passenger.passenger_name,
          type: passenger.passenger_type,
          arrivalTime: new Date(passenger.arrival_time),
          seatPreference: passenger.seat_preference,
          boardingTime: passenger.boarding_time ? new Date(passenger.boarding_time) : undefined,
          queuePosition: passenger.queue_position,
          status: passenger.status
        }

        queue.value.enqueue(passengerData)
        passengers.value.push(passengerData)
      })

      // Update queue positions
      updateQueuePositions()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load passengers'
    } finally {
      isLoading.value = false
    }
  }

  // Add passenger to queue
  const addPassenger = async (passenger: Omit<PassengerPriority, 'id' | 'arrivalTime'>) => {
    isLoading.value = true
    error.value = null

    try {
      const newPassenger: PassengerPriority = {
        id: crypto.randomUUID(),
        arrivalTime: new Date(),
        status: 'waiting',
        ...passenger
      }

      // Add to database
      const { error: insertError } = await supabase
        .from('passenger_queue')
        .insert({
          vehicle_id: vehicleId,
          passenger_name: newPassenger.name,
          passenger_type: newPassenger.type,
          arrival_time: newPassenger.arrivalTime.toISOString(),
          seat_preference: newPassenger.seatPreference,
          status: 'waiting'
        })

      if (insertError) throw insertError

      // Add to local queue
      queue.value.enqueue(newPassenger)
      passengers.value.push(newPassenger)

      // Update positions
      updateQueuePositions()

      // Assign seat if available
      await assignSeat(newPassenger.id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add passenger'
    } finally {
      isLoading.value = false
    }
  }

  // Board next passenger
  const boardNextPassenger = async (): Promise<PassengerPriority | null> => {
    const passenger = queue.value.dequeue()
    if (!passenger) return null

    isLoading.value = true
    error.value = null

    try {
      // Update database
      const { error: updateError } = await supabase
        .from('passenger_queue')
        .update({
          status: 'boarding',
          boarding_time: new Date().toISOString()
        })
        .eq('id', passenger.id)

      if (updateError) throw updateError

      // Remove from local passengers array
      passengers.value = passengers.value.filter((p: PassengerPriority) => p.id !== passenger.id)

      // Update queue positions
      updateQueuePositions()

      return { ...passenger, status: 'boarding', boardingTime: new Date() }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to board passenger'
      // Re-add to queue if database update failed
      queue.value.enqueue(passenger)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Remove passenger from queue
  const removePassenger = async (passengerId: string) => {
    isLoading.value = true
    error.value = null

    try {
      // Update database
      const { error: updateError } = await supabase
        .from('passenger_queue')
        .update({ status: 'cancelled' })
        .eq('id', passengerId)

      if (updateError) throw updateError

      // Remove from local state
      passengers.value = passengers.value.filter((p: PassengerPriority) => p.id !== passengerId)

      // Rebuild queue
      rebuildQueue()

      // Remove seat assignment
      seatAssignments.value = seatAssignments.value.filter(a => a.passengerId !== passengerId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to remove passenger'
    } finally {
      isLoading.value = false
    }
  }

  // Smart seat assignment algorithm
  const assignSeat = async (passengerId: string): Promise<string | null> => {
    const passenger = passengers.value.find((p: PassengerPriority) => p.id === passengerId)
    if (!passenger) return null

    let assignedSeat: string | null = null

    // Try to honor seat preference first
    if (passenger.seatPreference && availableSeats.value.includes(passenger.seatPreference)) {
      assignedSeat = passenger.seatPreference
    } else {
      // Assign based on passenger type priority
      const available = availableSeats.value
      if (available.length === 0) return null

      switch (passenger.type) {
        case 'vip':
          assignedSeat = available.find(seat => seat.startsWith('1')) ||
            available.find(seat => seat.startsWith('2')) ||
            available[0]
          break
        case 'elderly':
          assignedSeat = available.find(seat => seat.endsWith('A') || seat.endsWith('D')) || available[0]
          break
        case 'regular':
          assignedSeat = available.find(seat => seat.endsWith('B') || seat.endsWith('C')) || available[0]
          break
        case 'standby':
          assignedSeat = available[available.length - 1]
          break
        default:
          assignedSeat = available[0]
      }
    }

    if (assignedSeat) {
      seatAssignments.value.push({
        seatNumber: assignedSeat,
        passengerId
      })
    }

    return assignedSeat
  }

  // Update queue positions for all passengers
  const updateQueuePositions = async () => {
    const sortedPassengers = [...passengers.value].sort(passengerComparator)

    for (let i = 0; i < sortedPassengers.length; i++) {
      const passenger = sortedPassengers[i]
      passenger.queuePosition = i + 1

      // Update in database
      await supabase
        .from('passenger_queue')
        .update({ queue_position: i + 1 })
        .eq('id', passenger.id)
    }
  }

  // Rebuild queue from current passengers
  const rebuildQueue = () => {
    queue.value.clear()
    passengers.value.forEach((passenger: PassengerPriority) => {
      queue.value.enqueue(passenger)
    })
    updateQueuePositions()
  }

  // Setup realtime subscription
  const setupRealtimeSubscription = () => {
    subscription = supabase
      .channel(`boarding-queue-${vehicleId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'passenger_queue',
        filter: `vehicle_id=eq.${vehicleId}`
      }, () => {
        // Reload passengers when changes occur
        loadPassengers()
      })
      .subscribe()
  }

  // Cleanup subscription
  const cleanup = () => {
    if (subscription) {
      supabase.removeChannel(subscription)
      subscription = null
    }
  }

  // Get passenger position in queue
  const getPassengerPosition = (passengerId: string): number => {
    const passenger = passengers.value.find((p: PassengerPriority) => p.id === passengerId)
    return passenger?.queuePosition || -1
  }

  // Get estimated boarding time
  const getEstimatedBoardingTime = (passengerId: string): Date | null => {
    const position = getPassengerPosition(passengerId)
    if (position === -1) return null

    // Estimate 2 minutes per passenger ahead
    const estimatedMinutes = (position - 1) * 2
    const now = new Date()
    return new Date(now.getTime() + estimatedMinutes * 60000)
  }

  // Lifecycle
  onMounted(async () => {
    await loadPassengers()
    setupRealtimeSubscription()
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    // State
    queue: readonly(queue),
    passengers: readonly(passengers),
    isLoading: readonly(isLoading),
    error: readonly(error),
    seatAssignments: readonly(seatAssignments),

    // Computed
    queueSize,
    isEmpty,
    nextPassenger,
    passengersByType,
    availableSeats,

    // Methods
    loadPassengers,
    addPassenger,
    boardNextPassenger,
    removePassenger,
    assignSeat,
    getPassengerPosition,
    getEstimatedBoardingTime,

    // Utils
    updateQueuePositions,
    rebuildQueue,
    cleanup
  }
}
