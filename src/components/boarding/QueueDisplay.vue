<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900">Boarding Queue</h2>
        <div class="flex items-center space-x-2 text-sm text-gray-500">
          <UIcon name="i-heroicons-users" />
          <span>{{ passengers.length }} passengers</span>
        </div>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-blue-500" />
      <span class="ml-2 text-gray-600">Loading queue...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="passengers.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-queue-list" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No passengers in queue</h3>
      <p class="text-gray-500">Add passengers to start boarding</p>
    </div>

    <!-- Queue List -->
    <div v-else class="space-y-3">
      <TransitionGroup name="passenger" tag="div" class="space-y-3">
        <div
          v-for="(passenger, index) in sortedPassengers"
          :key="passenger.id"
          class="passenger-item"
        >
          <div
            class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            :class="getPassengerCardClasses(passenger, index)"
          >
            <!-- Left: Queue position and avatar -->
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                   :class="getPositionBadgeColor(passenger.type)">
                {{ index + 1 }}
              </div>

              <div class="flex items-center space-x-3">
                <UAvatar
                  :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(passenger.name)}&background=${getAvatarColor(passenger.type)}&color=fff`"
                  :alt="passenger.name"
                  size="md"
                />
                <div>
                  <div class="flex items-center space-x-2">
                    <p class="font-semibold text-gray-900">{{ passenger.name }}</p>
                    <UBadge
                      :color="getPriorityColor(passenger.type)"
                      variant="soft"
                      size="xs"
                    >
                      {{ passenger.type.toUpperCase() }}
                    </UBadge>
                  </div>
                  <div class="flex space-x-4 mt-1 text-sm text-gray-500">
                    <span>Arrived: {{ formatTime(passenger.arrivalTime) }}</span>
                    <span v-if="getAssignedSeat(passenger.id)">
                      Seat: {{ getAssignedSeat(passenger.id) }}
                    </span>
                    <span v-else-if="passenger.seatPreference">
                      Prefers: {{ passenger.seatPreference }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: priority, estimated time, actions -->
            <div class="flex items-center space-x-4">
              <div class="text-center">
                <div class="text-xs text-gray-500 mb-1">Priority</div>
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  :class="getPriorityBadgeColor(passenger.type)"
                >
                  {{ getPriorityLevel(passenger.type) }}
                </div>
              </div>

              <div class="text-center min-w-0 flex-1">
                <div class="text-xs text-gray-500 mb-1">Est. Boarding</div>
                <div class="text-sm font-medium text-gray-900 truncate">
                  {{ getEstimatedTime(index) }}
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <UButton
                  v-if="!getAssignedSeat(passenger.id)"
                  size="xs"
                  color="blue"
                  variant="soft"
                  @click="handleAssignSeat(passenger.id)"
                >
                  Assign Seat
                </UButton>

                <UButton
                  size="xs"
                  color="red"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  @click="handleRemovePassenger(passenger.id)"
                />
              </div>
            </div>
          </div>

          <div v-if="getAssignedSeat(passenger.id)" class="ml-14 -mt-1 mb-2">
            <div class="inline-flex items-center px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs">
              <UIcon name="i-heroicons-check-circle" class="w-3 h-3 mr-1" />
              Seat {{ getAssignedSeat(passenger.id) }} assigned
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <template #footer>
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500">
          {{ passengers.length }} passengers waiting • {{ getAssignedSeatsCount() }} seats assigned
        </div>
        <UButton variant="outline" size="sm" @click="showSeatMap = !showSeatMap">
          {{ showSeatMap ? 'Hide' : 'Show' }} Seat Map
        </UButton>
      </div>
    </template>
  </UCard>

  <UModal v-model="showSeatMap">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Vehicle Seat Map</h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" @click="showSeatMap = false" />
        </div>
      </template>

      <SeatMapVisualization
        :seat-assignments="seatAssignments"
        :passengers="passengers"
        @seat-selected="handleSeatSelection"
      />
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, defineEmits } from 'vue'
import type { PassengerPriority } from '~/utils/PriorityQueue'
import SeatMapVisualization from './SeatMapVisualization.vue'

interface Props {
  passengers: PassengerPriority[]
  seatAssignments: Array<{ seatNumber: string; passengerId: string }>
  isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  removePassenger: [passengerId: string]
  assignSeat: [passengerId: string, seatNumber: string]
}>()

const showSeatMap = ref(false)
const selectedPassengerForSeat = ref<string | null>(null)

const sortedPassengers = computed(() => {
  const priorityMap = {
    vip: 1,
    elderly: 2,
    regular: 3,
    standby: 4
  } as const

  return [...props.passengers].sort((a, b) => {
    const aPriority = priorityMap[a.type as keyof typeof priorityMap]
    const bPriority = priorityMap[b.type as keyof typeof priorityMap]

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
  })
})

const getPassengerCardClasses = (passenger: PassengerPriority, index: number) => {
  return index === 0 ? 'ring-2 ring-green-200 bg-green-50 transition-all duration-300' : 'transition-all duration-300'
}

const getPositionBadgeColor = (type: PassengerPriority['type']) =>
  ({ vip: 'bg-purple-500', elderly: 'bg-blue-500', regular: 'bg-green-500', standby: 'bg-orange-500' })[type]

const getPriorityBadgeColor = (type: PassengerPriority['type']) =>
  ({ vip: 'bg-purple-600', elderly: 'bg-blue-600', regular: 'bg-green-600', standby: 'bg-orange-600' })[type]

const getAvatarColor = (type: PassengerPriority['type']) =>
  ({ vip: '8b5cf6', elderly: '3b82f6', regular: '10b981', standby: 'f59e0b' })[type]

const getPriorityColor = (type: PassengerPriority['type']) =>
  ({ vip: 'purple', elderly: 'blue', regular: 'green', standby: 'orange' })[type]

const getPriorityLevel = (type: PassengerPriority['type']) =>
  ({ vip: 1, elderly: 2, regular: 3, standby: 4 }[type])

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(date))

const getEstimatedTime = (position: number) => {
  if (position === 0) return 'Now'
  const est = new Date(Date.now() + position * 2 * 60000)
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(est)
}

const getAssignedSeat = (passengerId: string) =>
  props.seatAssignments.find(a => a.passengerId === passengerId)?.seatNumber

const getAssignedSeatsCount = () => props.seatAssignments.length

const handleRemovePassenger = (passengerId: string) => emit('removePassenger', passengerId)

const handleAssignSeat = (passengerId: string) => {
  selectedPassengerForSeat.value = passengerId
  showSeatMap.value = true
}

const handleSeatSelection = (seatNumber: string) => {
  if (selectedPassengerForSeat.value) {
    emit('assignSeat', selectedPassengerForSeat.value, seatNumber)
    selectedPassengerForSeat.value = null
    showSeatMap.value = false
  }
}
</script>

<style scoped>
.passenger-enter-active, .passenger-leave-active {
  transition: all 0.3s ease;
}
.passenger-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.passenger-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.passenger-move {
  transition: transform 0.3s ease;
}
.passenger-item {
  position: relative;
}
.passenger-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.5), transparent);
  border-radius: 2px;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.passenger-item:hover::before {
  opacity: 1;
}
</style>
