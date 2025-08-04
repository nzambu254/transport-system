<template>
  <button
    :class="seatClasses"
    :disabled="isDisabled"
    @click="$emit('click')"
    class="w-10 h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-xs font-medium relative group"
  >
    <!-- Seat Number -->
    <span class="text-white">{{ seatNumber }}</span>
    
    <!-- Passenger Icon for assigned seats -->
    <UIcon 
      v-if="status !== 'available'" 
      name="i-heroicons-user" 
      class="absolute -top-1 -right-1 w-3 h-3 text-white bg-gray-800 rounded-full p-0.5"
    />
    
    <!-- Tooltip for assigned seats -->
    <div 
      v-if="passenger && status !== 'available'"
      class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
    >
      {{ passenger.name }}
      <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Define the passenger priority type locally
type PassengerType = 'vip' | 'elderly' | 'regular' | 'standby'

interface PassengerPriority {
  id: string
  name: string
  type: PassengerType
  arrivalTime: Date
  seatPreference?: string
}

interface Props {
  seatNumber: string
  status: 'available' | 'assigned' | 'vip' | 'elderly'
  passenger?: PassengerPriority
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

const isDisabled = computed(() => props.status !== 'available')

const seatClasses = computed(() => {
  const baseClasses = 'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  switch (props.status) {
    case 'available':
      return `${baseClasses} bg-green-500 border-green-600 hover:bg-green-600 focus:ring-green-500 cursor-pointer`
    case 'vip':
      return `${baseClasses} bg-purple-500 border-purple-600 cursor-not-allowed`
    case 'elderly':
      return `${baseClasses} bg-orange-500 border-orange-600 cursor-not-allowed`
    case 'assigned':
    default:
      return `${baseClasses} bg-blue-500 border-blue-600 cursor-not-allowed`
  }
})
</script>