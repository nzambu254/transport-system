<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Passenger Boarding System
        </h1>
        <p class="text-gray-600">
          Vehicle: {{ vehicleId }} | Queue Size: {{ queueSize }} | Available Seats: {{ availableSeats.length }}
        </p>
      </div>

      <!-- Error Alert -->
      <UAlert
        v-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="solid"
        :title="error"
        class="mb-6"
        :close-button="{
          icon: 'i-heroicons-x-mark-20-solid',
          color: 'white',
          variant: 'link'
        }"
        @close="error = null"
      />

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Add Passenger & Next Passenger -->
        <div class="space-y-6">
          <!-- Add New Passenger Card -->
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold text-gray-900">Add Passenger</h2>
            </template>

            <UForm :state="newPassengerForm" @submit="handleAddPassenger" class="space-y-4">
              <UFormGroup label="Passenger Name" required>
                <UInput
                  v-model="newPassengerForm.name"
                  placeholder="Enter passenger name"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Passenger Type" required>
                <USelect
                  v-model="newPassengerForm.type"
                  :options="passengerTypeOptions"
                  placeholder="Select passenger type"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Seat Preference (Optional)">
                <USelect
                  v-model="newPassengerForm.seatPreference"
                  :options="availableSeatOptions"
                  placeholder="Select preferred seat"
                />
              </UFormGroup>

              <UButton
                type="submit"
                :loading="isLoading"
                :disabled="!newPassengerForm.name || !newPassengerForm.type"
                block
              >
                Add Passenger
              </UButton>
            </UForm>
          </UCard>

          <!-- Next Passenger Card -->
          <UCard v-if="nextPassenger">
            <template #header>
              <h2 class="text-xl font-semibold text-gray-900">Next to Board</h2>
            </template>

            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <UAvatar
                  :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(nextPassenger.name)}&background=0ea5e9&color=fff`"
                  :alt="nextPassenger.name"
                  size="lg"
                />
                <div>
                  <p class="font-semibold text-gray-900">{{ nextPassenger.name }}</p>
                  <p class="text-sm text-gray-500 capitalize">
                    {{ nextPassenger.type }} Passenger
                  </p>
                </div>
                <UBadge
                  :color="getPriorityColor(nextPassenger.type)"
                  variant="solid"
                >
                  Priority {{ getPriorityLevel(nextPassenger.type) }}
                </UBadge>
              </div>

              <div class="text-sm text-gray-600">
                <p>Arrival: {{ formatTime(nextPassenger.arrivalTime) }}</p>
                <p v-if="nextPassenger.seatPreference">
                  Preferred Seat: {{ nextPassenger.seatPreference }}
                </p>
              </div>

              <UButton
                @click="handleBoardPassenger"
                :loading="isLoading"
                color="green"
                block
              >
                Board Passenger
              </UButton>
            </div>
          </UCard>

          <!-- Empty Queue Message -->
          <UCard v-else-if="!isLoading">
            <div class="text-center py-8">
              <UIcon name="i-heroicons-queue-list" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p class="text-gray-500">No passengers in queue</p>
            </div>
          </UCard>
        </div>

        <!-- Middle Column: Queue Display -->
        <div class="lg:col-span-2">
          <BoardingQueueDisplay
            :passengers="passengers"
            :seat-assignments="seatAssignments"
            :is-loading="isLoading"
            @remove-passenger="handleRemovePassenger"
          />
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">VIP Passengers</p>
              <p class="text-2xl font-bold text-purple-600">{{ passengersByType.vip.length }}</p>
            </div>
            <UIcon name="i-heroicons-star" class="w-8 h-8 text-purple-600" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Elderly/Disabled</p>
              <p class="text-2xl font-bold text-blue-600">{{ passengersByType.elderly.length }}</p>
            </div>
            <UIcon name="i-heroicons-heart" class="w-8 h-8 text-blue-600" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Regular</p>
              <p class="text-2xl font-bold text-green-600">{{ passengersByType.regular.length }}</p>
            </div>
            <UIcon name="i-heroicons-user" class="w-8 h-8 text-green-600" />
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Standby</p>
              <p class="text-2xl font-bold text-orange-600">{{ passengersByType.standby.length }}</p>
            </div>
            <UIcon name="i-heroicons-clock" class="w-8 h-8 text-orange-600" />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBoardingQueue } from '~/composables/useBoardingQueue'
import BoardingQueueDisplay from '~/components/boarding/QueueDisplay.vue'
import { definePageMeta } from '#imports' // for Nuxt 3, otherwise remove

definePageMeta({
  title: 'Boarding Queue Management'
})

const vehicleId = ref('BUS-001')

const {
  passengers,
  isLoading,
  error,
  queueSize,
  nextPassenger,
  passengersByType,
  availableSeats,
  seatAssignments,
  addPassenger,
  boardNextPassenger,
  removePassenger
} = useBoardingQueue(vehicleId.value)

const newPassengerForm = ref({
  name: '',
  type: '' as 'vip' | 'elderly' | 'regular' | 'standby' | '',
  seatPreference: ''
})

const passengerTypeOptions = [
  { label: 'VIP Passenger', value: 'vip' },
  { label: 'Elderly/Disabled', value: 'elderly' },
  { label: 'Regular Passenger', value: 'regular' },
  { label: 'Standby Passenger', value: 'standby' }
]

const availableSeatOptions = computed(() => 
  availableSeats.value.map((seat: string) => ({ label: seat, value: seat }))
)

const handleAddPassenger = async () => {
  if (!newPassengerForm.value.name || !newPassengerForm.value.type) return

  await addPassenger({
    name: newPassengerForm.value.name,
    type: newPassengerForm.value.type,
    seatPreference: newPassengerForm.value.seatPreference || undefined
  })

  newPassengerForm.value = {
    name: '',
    type: '',
    seatPreference: ''
  }
}

const handleBoardPassenger = async () => {
  const boardedPassenger = await boardNextPassenger()
  if (boardedPassenger) {
    console.log('Boarded passenger:', boardedPassenger)
  }
}

const handleRemovePassenger = async (passengerId: string) => {
  await removePassenger(passengerId)
}

const getPriorityColor = (type: string) => {
  const colors = {
    vip: 'purple',
    elderly: 'blue',
    regular: 'green',
    standby: 'orange'
  }
  return colors[type as keyof typeof colors] || 'gray'
}

const getPriorityLevel = (type: string) => {
  const levels = {
    vip: 1,
    elderly: 2,
    regular: 3,
    standby: 4
  }
  return levels[type as keyof typeof levels] || 0
}

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}
</script>
