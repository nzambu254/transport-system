export interface PassengerPriority {
  id: string
  vehicleId: string
  name: string
  type: 'vip' | 'elderly' | 'regular' | 'standby'
  arrivalTime: Date
  seatPreference?: string
  status: 'waiting' | 'boarding' | 'boarded'
  boardingTime?: Date
  queuePosition: number
}

export class PriorityQueue<T extends { queuePosition: number }> {
  private items: T[] = []

  enqueue(item: T) {
    this.items.push(item)
    this.items.sort((a, b) => a.queuePosition - b.queuePosition)
  }

  dequeue(): T | undefined {
    return this.items.shift()
  }

  peek(): T | undefined {
    return this.items[0]
  }

  clear() {
    this.items = []
  }

  size(): number {
    return this.items.length
  }

  toArray(): T[] {
    return [...this.items]
  }

  // Find the index of an item that matches the predicate
  findIndex(predicate: (item: T) => boolean): number {
    return this.items.findIndex(predicate)
  }

  // Update an existing item at a given index by merging new data
  update(index: number, newData: Partial<T>) {
    if (index >= 0 && index < this.items.length) {
      this.items[index] = { ...this.items[index], ...newData }
      // Re-sort after update to maintain priority order
      this.items.sort((a, b) => a.queuePosition - b.queuePosition)
    }
  }

  // Helper method to find and update by predicate
  findAndUpdate(predicate: (item: T) => boolean, newData: Partial<T>): boolean {
    const index = this.findIndex(predicate)
    if (index !== -1) {
      this.update(index, newData)
      return true
    }
    return false
  }
}

// Factory function to create a PriorityQueue for PassengerPriority
export function createPassengerQueue() {
  return new PriorityQueue<PassengerPriority>()
}