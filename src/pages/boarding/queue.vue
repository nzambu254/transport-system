<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBoardingStore } from '~/stores/boarding'
import PassengerForm from '~/components/boarding/PassengerForm.vue'
import QueueDisplay from '~/components/boarding/QueueDisplay.vue'

const route = useRoute()
const store = useBoardingStore()

const vehicleId = computed(() => route.params.vehicleId as string)

onMounted(() => {
  store.setVehicle(vehicleId.value)
  store.subscribeToUpdates()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <PassengerForm />
      </div>
      <div>
        <QueueDisplay />
      </div>
    </div>
  </div>
</template>