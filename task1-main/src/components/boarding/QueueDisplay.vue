<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">Boarding Queue</h2>
        <UBadge :color="queueSize > 0 ? 'blue' : 'gray'" variant="soft">
          {{ queueSize }} passengers
        </UBadge>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-blue-500" />
      <span class="ml-2 text-gray-600">Loading...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="queueSize === 0" class="text-center py-12">
      <UIcon name="i-heroicons-queue-list" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No passengers in queue</h3>
      <p class="text-gray-500">Add passengers to start boarding</p>
    </div>

    <!-- Queue List -->
    <div v-else class="space-y-3">
      <!-- Priority Groups -->
      <div v-for="(group, groupType) in groupedPassengers" :key="groupType" class="space-y-2">
        <div v-if="group.length > 0">
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center">
            <UIcon :name="getGroupIcon(groupType)" class="w-4 h-4 mr-2" />
            {{ getGroupLabel(groupType) }} ({{ group.length }})
          </h3>
          
          <div class="space-y-2">
            <div
              v-for="(passenger, index) in group"
              :key="passenger.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              :class="{
                'ring-2 ring-blue-500 ring-opacity-50 border-blue-300': passenger.id === nextPassengerId,
                'bg-gray-50': passenger.status === 'boarded'
              }"
            >
              <!-- Passenger Info -->
              <div class="flex items-center space-x-3 flex-1">
                <!-- Queue Position -->
                <div class="flex-shrink-0">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                    :class="getPositionBadgeClass(groupType)"
                  >
                    {{ getQueuePosition(passenger.id) }}
                  </div>
                </div>

                <!-- Avatar -->
                <UAvatar
                  :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(passenger.name)}&background=${getTypeColor(passenger.type)}&color=fff`"
                  :alt="passenger.name"
                  size="md"
                />

                <!-- Details -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {{ passenger.name }}
                    </p>
                    <UBadge
                      :color="getTypeColor(passenger.type)"
                      variant="soft"
                      size="xs"
                    >
                      {{ passenger.type.toUpperCase() }}
                    </UBadge>
                    <UBadge
                      v-if="passenger.id === nextPassengerId"
                      color="blue"
                      variant="solid"
                      size="xs"
                    >
                      NEXT
                    </UBadge>
                  </div>
                  
                  <div class="flex items-center space-x-4 mt-1">
                    <p class="text-xs text-gray-500">
                      Arrived: {{ formatTime(passenger.arrivalTime) }}
                    </p>
                    <p v-if="passenger.assignedSeat" class="text-xs text-blue-600 font-medium">
                      Seat: {{ passenger.assignedSeat }}
                    </p>
                    <p v-else-if="passenger.seatPreference" class="text-xs text-gray-500">
                      Prefers: {{ passenger.seatPreference }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Status & Actions -->
              <div class="flex items-center space-x-2">
                <!-- Status Badge -->
                <UBadge
                  :color="getStatusColor(passenger.status)"
                  :variant="passenger.status === 'boarded' ? 'solid' : 'soft'"
                  size="sm"
                >
                  {{ passenger.status.toUpperCase() }}
                </UBadge>

                <!-- Actions -->
                <div class="flex items-center space-x-1">
                  <UTooltip text="Remove from queue">
                    <UButton
                      icon="i-heroicons-x-mark"
                      size="sm"
                      color="red"
                      variant="ghost"
                      :disabled="isLoading"
                      @click="handleRemovePassenger(passenger.id)"
                    />
                  </UTooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Seat Assignment Summary -->
      <div v-if="seatAssignments.length > 0" class="mt-6 pt-4 border-t border-gray-200">
        <h3 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4 mr-2" />
          Seat Assignments ({{ seatAssignments.length }})
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <div
            v-for="assignment in seatAssignments"
            :key="assignment.seatId"
            class="flex items-center space-x-2 p-2 bg-blue-50 rounded text-xs"
          >
            <UIcon name="i-heroicons-squares-2x2" class="w-3 h-3 text-blue-600" />
            <span class="font-medium text-blue-900">{{ assignment.seatId }}</span>
            <span class="text-blue-700 truncate">{{ assignment.passengerName }}</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Passenger {
  id: string
  name: string
  type: 'vip' | 'elderly' | 'regular' | 'standby'
  arrivalTime: Date
  seatPreference?: string
  assignedSeat?: string
  status: 'waiting' | 'boarding' | 'boarded'
}

interface SeatAssignment {
  seatId: string
  passengerId: string
  passengerName: string
}

const props = defineProps<{
  passengers: Passenger[]
  seatAssignments: SeatAssignment[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  removePassenger: [passengerId: string]
}>()

const queueSize = computed(() => 
  props.passengers.filter(p => p.status === 'waiting').length
)

const nextPassengerId = computed(() => {
  const waitingPassengers = props.passengers
    .filter(p => p.status === 'waiting')
    .sort((a, b) => {
      const priorityOrder = { vip: 1, elderly: 2, regular: 3, standby: 4 }
      const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type]
      
      if (priorityDiff !== 0) return priorityDiff
      return a.arrivalTime.getTime() - b.arrivalTime.getTime()
    })
  
  return waitingPassengers[0]?.id || null
})

const groupedPassengers = computed(() => {
  const waiting = props.passengers.filter(p => p.status === 'waiting')
  
  return {
    vip: waiting.filter(p => p.type === 'vip').sort((a, b) => a.arrivalTime.getTime() - b.arrivalTime.getTime()),
    elderly: waiting.filter(p => p.type === 'elderly').sort((a, b) => a.arrivalTime.getTime() - b.arrivalTime.getTime()),
    regular: waiting.filter(p => p.type === 'regular').sort((a, b) => a.arrivalTime.getTime() - b.arrivalTime.getTime()),
    standby: waiting.filter(p => p.type === 'standby').sort((a, b) => a.arrivalTime.getTime() - b.arrivalTime.getTime())
  }
})

const getQueuePosition = (passengerId: string) => {
  const waitingPassengers = props.passengers
    .filter(p => p.status === 'waiting')
    .sort((a, b) => {
      const priorityOrder = { vip: 1, elderly: 2, regular: 3, standby: 4 }
      const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type]
      
      if (priorityDiff !== 0) return priorityDiff
      return a.arrivalTime.getTime() - b.arrivalTime.getTime()
    })
  
  return waitingPassengers.findIndex(p => p.id === passengerId) + 1
}

const getGroupLabel = (groupType: string) => {
  const labels = {
    vip: 'VIP Passengers',
    elderly: 'Elderly/Disabled',
    regular: 'Regular Passengers',
    standby: 'Standby Passengers'
  }
  return labels[groupType as keyof typeof labels] || groupType
}

const getGroupIcon = (groupType: string) => {
  const icons = {
    vip: 'i-heroicons-star',
    elderly: 'i-heroicons-heart',
    regular: 'i-heroicons-user',
    standby: 'i-heroicons-clock'
  }
  return icons[groupType as keyof typeof icons] || 'i-heroicons-user'
}

const getTypeColor = (type: string) => {
  const colors = {
    vip: 'purple',
    elderly: 'blue',
    regular: 'green',
    standby: 'orange'
  }
  return colors[type as keyof typeof colors] || 'gray'
}

const getStatusColor = (status: string) => {
  const colors = {
    waiting: 'yellow',
    boarding: 'blue',
    boarded: 'green'
  }
  return colors[status as keyof typeof colors] || 'gray'
}

const getPositionBadgeClass = (groupType: string) => {
  const classes = {
    vip: 'bg-purple-100 text-purple-800',
    elderly: 'bg-blue-100 text-blue-800',
    regular: 'bg-green-100 text-green-800',
    standby: 'bg-orange-100 text-orange-800'
  }
  return classes[groupType as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

const handleRemovePassenger = (passengerId: string) => {
  emit('removePassenger', passengerId)
}
</script>