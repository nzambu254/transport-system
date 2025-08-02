<script setup lang="ts">
import { useBoardingStore } from '~/stores/boarding';

const route = useRoute();
const store = useBoardingStore();

const vehicleId = computed(() => route.params.vehicleId as string);

onMounted(() => {
  store.setVehicle(vehicleId.value);
  store.subscribeToUpdates();
});
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