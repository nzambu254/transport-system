import { createPassengerQueue, type PassengerPriority } from '~/utils/PriorityQueue';
import { useSupabaseClient } from '#imports';

export const useBoardingQueue = () => {
  const supabase = useSupabaseClient();
  const queue = createPassengerQueue();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchPassengers = async (vehicleId: string) => {
    try {
      loading.value = true;
      const { data, error: fetchError } = await supabase
        .from('passenger_queue')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('arrival_time', { ascending: true });

      if (fetchError) throw fetchError;

      data?.forEach(passenger => {
        queue.enqueue({
          ...passenger,
          arrivalTime: new Date(passenger.arrival_time),
          boardingTime: passenger.boarding_time ? new Date(passenger.boarding_time) : undefined
        });
      });

    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const addPassenger = async (passenger: Omit<PassengerPriority, 'id'>) => {
    try {
      loading.value = true;
      const { data, error: insertError } = await supabase
        .from('passenger_queue')
        .insert({
          vehicle_id: passenger.vehicleId,
          passenger_name: passenger.name,
          passenger_type: passenger.type,
          arrival_time: passenger.arrivalTime.toISOString(),
          seat_preference: passenger.seatPreference,
          status: 'waiting'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      queue.enqueue({
        ...passenger,
        id: data.id,
        queuePosition: queue.size() + 1
      });

      return data;

    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const boardPassenger = async (passengerId: string) => {
    try {
      loading.value = true;
      const { data, error: updateError } = await supabase
        .from('passenger_queue')
        .update({
          status: 'boarding',
          boarding_time: new Date().toISOString()
        })
        .eq('id', passengerId)
        .select()
        .single();

      if (updateError) throw updateError;

      return data;

    } catch (err) {
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    queue,
    loading,
    error,
    fetchPassengers,
    addPassenger,
    boardPassenger
  };
};