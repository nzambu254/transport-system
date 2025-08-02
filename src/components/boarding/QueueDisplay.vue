<script setup lang="ts">
import { useBoardingStore } from '~/stores/boarding';

const store = useBoardingStore();

const priorityColors = {
  vip: 'bg-purple-500',
  elderly: 'bg-blue-500',
  regular: 'bg-green-500',
  standby: 'bg-gray-500'
};

const boardNextPassenger = async () => {
  if (store.nextPassenger) {
    await store.boardPassenger(store.nextPassenger.id);
  }
};
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="font-semibold text-lg">Boarding Queue</h3>
        <UButton 
          :disabled="!store.nextPassenger || store.loading"
          @click="boardNextPassenger"
        >
          Board Next Passenger
        </UButton>
      </div>
    </template>

    <div v-if="store.error" class="text-red-500 mb-4">
      {{ store.error }}
    </div>

    <div class="space-y-2">
      <div 
        v-for="passenger in store.passengers" 
        :key="passenger.id"
        class="p-4 border rounded-lg flex items-center justify-between"
        :class="{
          'border-blue-500': passenger.id === store.nextPassenger?.id,
          'border-gray-200': passenger.id !== store.nextPassenger?.id
        }"
      >
        <div class="flex items-center space-x-4">
          <div 
            class="w-8 h-8 rounded-full flex items-center justify-center text-white"
            :class="priorityColors[passenger.type]"
          >
            {{ passenger.queuePosition }}
          </div>
          
          <div>
            <p class="font-medium">{{ passenger.name }}</p>
            <p class="text-sm text-gray-500 capitalize">
              {{ passenger.type }} • Arrived {{ format(passenger.arrivalTime, 'HH:mm') }}
            </p>
          </div>
        </div>

        <div v-if="passenger.seatPreference" class="text-sm">
          Seat: {{ passenger.seatPreference }}
        </div>
      </div>

      <div v-if="store.passengers.length === 0" class="text-center py-8 text-gray-500">
        No passengers in queue
      </div>
    </div>
  </UCard>
</template>