<script setup lang="ts">
import type { PassengerPriority } from '~/utils/PriorityQueue'

const props = defineProps<{
  passengers: PassengerPriority[]
  currentBoarding?: string
}>()

const priorityColors = {
  vip: 'bg-purple-500',
  elderly: 'bg-blue-500',
  regular: 'bg-green-500',
  standby: 'bg-gray-500'
} as const

const statusIcons = {
  waiting: 'i-heroicons-clock',
  boarding: 'i-heroicons-arrow-right-circle',
  boarded: 'i-heroicons-check-circle'
}
</script>

<template>
  <div class="space-y-2">
    <div 
      v-for="passenger in passengers" 
      :key="passenger.id"
      class="p-4 border rounded-lg transition-all"
      :class="{
        'border-blue-500 shadow-lg': currentBoarding === passenger.id,
        'border-gray-200': currentBoarding !== passenger.id
      }"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            :class="priorityColors[passenger.type]"
          >
            {{ passenger.queuePosition }}
          </div>
          
          <div>
            <div class="flex items-center space-x-2">
              <p class="font-medium">{{ passenger.name }}</p>
              <span class="text-xs px-2 py-1 rounded-full capitalize" 
                    :class="{
                      'bg-purple-100 text-purple-800': passenger.type === 'vip',
                      'bg-blue-100 text-blue-800': passenger.type === 'elderly',
                      'bg-green-100 text-green-800': passenger.type === 'regular',
                      'bg-gray-100 text-gray-800': passenger.type === 'standby'
                    }">
                {{ passenger.type }}
              </span>
            </div>
            <p class="text-sm text-gray-500">
              Arrived {{ passenger.arrivalTime.toLocaleTimeString() }}
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <div v-if="passenger.seatPreference" class="text-sm bg-yellow-50 px-3 py-1 rounded">
            Seat: {{ passenger.seatPreference }}
          </div>
          <div :class="statusIcons[passenger.status || 'waiting']" 
               class="w-6 h-6"
               :style="{
                 color: passenger.status === 'boarding' ? 'var(--color-primary-500)' : 
                        passenger.status === 'boarded' ? 'var(--color-green-500)' : 
                        'var(--color-gray-500)'
               }" />
        </div>
      </div>
    </div>

    <div v-if="passengers.length === 0" class="text-center py-8 text-gray-500">
      No passengers in queue
    </div>
  </div>
</template>