import { defineStore } from 'pinia';
import { useBoardingQueue } from '~/composables/useBoardingQueue';

export const useBoardingStore = defineStore('boarding', () => {
  const { queue, loading, error, fetchPassengers, addPassenger, boardPassenger } = useBoardingQueue();
  const currentVehicle = ref<string | null>(null);

  const passengers = computed(() => queue.toArray());
  const nextPassenger = computed(() => queue.peek());

  const setVehicle = (vehicleId: string) => {
    currentVehicle.value = vehicleId;
    fetchPassengers(vehicleId);
  };

  const subscribeToUpdates = () => {
    const supabase = useSupabaseClient();

    return supabase
      .channel('passenger_queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'passenger_queue',
          filter: `vehicle_id=eq.${currentVehicle.value}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            queue.enqueue({
              ...payload.new,
              arrivalTime: new Date(payload.new.arrival_time),
              boardingTime: payload.new.boarding_time ? new Date(payload.new.boarding_time) : undefined
            });
          } else if (payload.eventType === 'UPDATE') {
            // Update logic would go here
          } else if (payload.eventType === 'DELETE') {
            // Delete logic would go here
          }
        }
      )
      .subscribe();
  };

  return {
    currentVehicle,
    passengers,
    nextPassenger,
    loading,
    error,
    setVehicle,
    addPassenger,
    boardPassenger,
    subscribeToUpdates
  };
});