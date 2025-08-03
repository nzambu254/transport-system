// types/priority-queue.d.ts (OPTIONAL - you can delete this file)
// Since you're already exporting types from the actual implementation,
// this declaration file is not needed. 

// If you want to keep it for some reason, here's the corrected version:
declare module '~/utils/PriorityQueue' {
  interface PassengerPriority {
    id: string
    vehicleId: string
    name: string
    type: 'vip' | 'elderly' | 'regular' | 'standby'
    arrivalTime: Date
    boardingTime?: Date
    seatPreference?: string
    status?: 'waiting' | 'boarding' | 'boarded'
    queuePosition: number
  }

  class PriorityQueue<T extends PassengerPriority> {
    enqueue(item: T): void
    dequeue(): T | undefined
    peek(): T | undefined
    size(): number
    isEmpty(): boolean
    clear(): void
    toArray(): T[]
  }

  export function createPassengerQueue(): PriorityQueue<PassengerPriority>
  export { PassengerPriority, PriorityQueue }
}