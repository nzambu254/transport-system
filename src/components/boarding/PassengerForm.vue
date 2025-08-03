<script setup lang="ts">
import { ref } from 'vue'
import { useBoardingStore } from '~/stores/boarding'

const store = useBoardingStore()
const form = ref({
  name: '',
  type: 'regular',
  seatPreference: '',
  vehicleId: ''
})

const passengerTypes = [
  { value: 'vip', label: 'VIP' },
  { value: 'elderly', label: 'Elderly' },
  { value: 'regular', label: 'Regular' },
  { value: 'standby', label: 'Standby' }
]

const handleSubmit = async () => {
  if (!form.value.name || !store.currentVehicle) return

  await store.addPassenger({
    name: form.value.name,
    type: form.value.type,
    seatPreference: form.value.seatPreference,
    arrivalTime: new Date(),
    vehicleId: store.currentVehicle
  })

  form.value.name = ''
  form.value.seatPreference = ''
}
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="font-semibold text-lg">Passenger Check-In</h3>
    </template>

    <UForm :state="form" @submit="handleSubmit" class="space-y-4">
      <UFormGroup label="Name" name="name" required>
        <UInput v-model="form.name" />
      </UFormGroup>

      <UFormGroup label="Passenger Type" name="type">
        <USelect v-model="form.type" :options="passengerTypes" />
      </UFormGroup>

      <UFormGroup label="Seat Preference" name="seatPreference">
        <UInput v-model="form.seatPreference" />
      </UFormGroup>

      <UButton type="submit" :loading="store.loading">
        Check In
      </UButton>
    </UForm>
  </UCard>
</template>