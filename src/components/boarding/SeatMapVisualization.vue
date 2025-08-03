<template>
  <div class="p-4">
    <!-- Vehicle Layout -->
    <div class="max-w-md mx-auto">
      <!-- Driver Section -->
      <div class="mb-6">
        <div class="flex justify-center mb-2">
          <div class="w-16 h-12 bg-gray-300 rounded-t-lg flex items-center justify-center">
            <UIcon name="i-heroicons-truck" class="w-6 h-6 text-gray-600" />
          </div>
        </div>
        <p class="text-center text-sm text-gray-500">Driver</p>
      </div>

      <!-- Seat Grid -->
      <div class="space-y-3">
        <div
          v-for="row in seatRows"
          :key="row"
          class="flex justify-center space-x-2"
        >
          <!-- Left Seats (A, B) -->
          <div class="flex space-x-1">
            <SeatButton
              :seat-number="`${row}A`"
              :status="getSeatStatus(`${row}A`)"
              :passenger="getPassengerForSeat(`${row}A`)"
              @click="handleSeatClick(`${row}A`)"
            />
            <SeatButton
              :seat-number="`${row}B`"
              :status="getSeatStatus(`${row}B`)"
              :passenger="getPassengerForSeat(`${row}B`)"
              @click="handleSeatClick(`${row}B`)"
            />
          </div>

          <!-- Aisle -->
          <div class="w-8 flex items-center justify-center">
            <div class="w-1 h-8 bg-gray-200 rounded"></div>
          </div>

          <!-- Right Seats (C, D) -->
          <div class="flex space-x-1">
            <SeatButton
              :seat-number="`${row}C`"
              :status="getSeatStatus(`${row}C`)"
              :passenger="getPassengerForSeat(`${row}C`)"
              @click="handleSeatClick(`${row}C`)"
            />
            <SeatButton
              :seat-number="`${row}D`"
              :status="getSeatStatus(`${row}D`)"
              :passenger="getPassengerForSeat(`${row}D`)"
              @click="handleSeatClick(`${row}D`)"
            />
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-8 space-y-3">
        <h4 class="font-medium text-gray-900">Legend</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Assigned</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-purple-500 rounded"></div>
            <span>VIP</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-orange-500 rounded"></div>
            <span>Elderly/Disabled</span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-lg font-bold text-green-600">{{ availableSeats.length }}</div>
            <div class="text-xs text-gray-500">Available</div>
          </div>
          <div>
            <div class="text-lg font-bold text-blue-600">{{ assignedSeats.length }}</div>
            <div class="text-xs text-gray-500">Assigned</div>
          </div>
          <div>
            <div class="text-lg font-bold text-gray-600">{{ totalSeats }}</div>
            <div class="text-xs text-gray-500">Total</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineEmits } from 'vue'
import type { PassengerPriority } from '~/utils/priorityQueue'  // Corrected import path here
import SeatButton from './SeatButton.vue'

// Props
interface Props {
  seatAssignments: Array<{ seatNumber: string; passengerId: string }>
  passengers: PassengerPriority[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  seatSelected: [seatNumber: string]
}>()

// Constants
const totalSeats = 50
const seatsPerRow = 4
const totalRows = Math.ceil(totalSeats / seatsPerRow)

// Computed
const seatRows = computed(() => {
  return Array.from({ length: totalRows }, (_, i) => i + 1)
})

const assignedSeats = computed(() => {
  return props.seatAssignments.map(a => a.seatNumber)
})

const availableSeats = computed(() => {
  const allSeats: string[] = []
  for (let row = 1; row <= totalRows; row++) {
    for (const letter of ['A', 'B', 'C', 'D']) {
      const seatNumber = `${row}${letter}`
      if (!assignedSeats.value.includes(seatNumber)) {
        allSeats.push(seatNumber)
      }
    }
  }
  return allSeats
})

// Methods
const getSeatStatus = (seatNumber: string): 'available' | 'assigned' | 'vip' | 'elderly' => {
  const assignment = props.seatAssignments.find(a => a.seatNumber === seatNumber)
  if (!assignment) return 'available'
  
  const passenger = props.passengers.find(p => p.id === assignment.passengerId)
  if (!passenger) return 'assigned'
  
  if (passenger.type === 'vip') return 'vip'
  if (passenger.type === 'elderly') return 'elderly'
  
  return 'assigned'
}

const getPassengerForSeat = (seatNumber: string): PassengerPriority | undefined => {
  const assignment = props.seatAssignments.find(a => a.seatNumber === seatNumber)
  if (!assignment) return undefined
  
  return props.passengers.find(p => p.id === assignment.passengerId)
}

const handleSeatClick = (seatNumber: string) => {
  if (getSeatStatus(seatNumber) === 'available') {
    emit('seatSelected', seatNumber)
  }
}
</script>
