<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useBoardingStore } from '@/stores/boarding'

const route = useRoute()
const vehicleId = route.params.vehicleId as string

const boardingStore = useBoardingStore()
// FIX: Removed 'queue' from storeToRefs since it's not exposed by the store
const { loading, error, passengers, nextPassenger } = storeToRefs(boardingStore)

onMounted(() => {
  boardingStore.setVehicle(vehicleId)
})

const handleBoardNext = async () => {
  if (nextPassenger.value) {
    await boardingStore.boardPassenger(nextPassenger.value.id)
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold">Boarding Queue</h2>
        <UButton
          :loading="loading"
          :disabled="!nextPassenger"
          @click="handleBoardNext"
        >
          Board Next Passenger
        </UButton>
      </div>
    </template>

    <div v-if="error" class="mb-4">
      <UAlert :title="error" variant="error" />
    </div>

    <QueueDisplay
      :passengers="passengers"
      :current-boarding="nextPassenger?.id"
    />

    <template #footer>
      <div class="flex justify-between items-center text-sm text-gray-500">
        <span>Total Passengers: {{ passengers.length }}</span>
        <span>Next: {{ nextPassenger?.name || 'None' }}</span>
      </div>
    </template>
  </UCard>
</template>