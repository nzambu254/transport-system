<template>
  <button
    :class="seatClasses"
    :disabled="!isAvailable"
    @click="handleClick"
    :title="tooltipText"
  >
    <!-- Seat Number -->
    <span class="text-xs font-medium">{{ seatNumber }}</span>
    
    <!-- Passenger Indicator -->
    <div v-if="passenger" class="absolute -top-1 -right-1">
      <div class="w-3 h-3 rounded-full bg-white border-2 border-current flex items-center justify-center">
        <div class="w-1 h-1 bg-current rounded-full"></div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PassengerPriority } from '~/utils/priorityQueue'  // Correct import, no inline comment

// Props
interface Props {
  seatNumber: string;
  status: 'available' | 'assigned' | 'vip' | 'elderly';
  passenger?: PassengerPriority;
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'click', seatNumber: string): void
}>()

// Computed
const isAvailable = computed(() => props.status === 'available')

const seatClasses = computed(() => {
  const baseClasses = 'relative w-8 h-8 rounded-md text-white font-medium text-xs flex items-center justify-center transition-all duration-200 transform'
  
  switch (props.status) {
    case 'available':
      return `${baseClasses} bg-green-500 hover:bg-green-600 hover:scale-105 cursor-pointer shadow-sm hover:shadow-md`
    case 'vip':
      return `${baseClasses} bg-purple-500 cursor-not-allowed opacity-90`
    case 'elderly':
      return `${baseClasses} bg-orange-500 cursor-not-allowed opacity-90`
    case 'assigned':
      return `${baseClasses} bg-blue-500 cursor-not-allowed opacity-90`
    default:
      return `${baseClasses} bg-gray-400 cursor-not-allowed`
  }
})

const tooltipText = computed(() => {
  if (props.passenger) {
    return `${props.seatNumber} - ${props.passenger.name} (${props.passenger.type})`
  }
  
  switch (props.status) {
    case 'available':
      return `${props.seatNumber} - Available`
    case 'assigned':
      return `${props.seatNumber} - Assigned`
    case 'vip':
      return `${props.seatNumber} - VIP Passenger`
    case 'elderly':
      return `${props.seatNumber} - Elderly/Disabled Passenger`
    default:
      return props.seatNumber
  }
})

// Methods
const handleClick = () => {
  if (isAvailable.value) {
    emit('click', props.seatNumber)
  }
}
</script>
