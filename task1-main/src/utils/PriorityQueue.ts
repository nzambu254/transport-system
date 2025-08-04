export type PassengerType = 'vip' | 'elderly' | 'regular' | 'standby'

export interface PassengerPriority {
  id: string
  name: string
  type: PassengerType
  seatNumber?: string
  timestamp: Date
  priority: number
}

export class PriorityQueue<T> {
  private items: T[] = []
  private compare: (a: T, b: T) => number

  constructor(compareFn: (a: T, b: T) => number) {
    this.compare = compareFn
  }

  enqueue(item: T): void {
    this.items.push(item)
    this.bubbleUp(this.items.length - 1)
  }

  dequeue(): T | undefined {
    if (this.items.length === 0) return undefined
    if (this.items.length === 1) return this.items.pop()

    const root = this.items[0]
    this.items[0] = this.items.pop()!
    this.bubbleDown(0)
    return root
  }

  peek(): T | undefined {
    return this.items[0]
  }

  size(): number {
    return this.items.length
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }

  toArray(): T[] {
    return [...this.items]
  }

  private bubbleUp(index: number): void {
    if (index === 0) return

    const parentIndex = Math.floor((index - 1) / 2)
    if (this.compare(this.items[index], this.items[parentIndex]) < 0) {
      this.swap(index, parentIndex)
      this.bubbleUp(parentIndex)
    }
  }

  private bubbleDown(index: number): void {
    const leftChild = 2 * index + 1
    const rightChild = 2 * index + 2
    let smallest = index

    if (leftChild < this.items.length && 
        this.compare(this.items[leftChild], this.items[smallest]) < 0) {
      smallest = leftChild
    }

    if (rightChild < this.items.length && 
        this.compare(this.items[rightChild], this.items[smallest]) < 0) {
      smallest = rightChild
    }

    if (smallest !== index) {
      this.swap(index, smallest)
      this.bubbleDown(smallest)
    }
  }

  private swap(i: number, j: number): void {
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]]
  }
}

// Passenger priority comparator (lower number = higher priority)
export const passengerComparator = (a: PassengerPriority, b: PassengerPriority): number => {
  // First compare by priority level
  if (a.priority !== b.priority) {
    return a.priority - b.priority
  }
  
  // If same priority, compare by timestamp (earlier = higher priority)
  return a.timestamp.getTime() - b.timestamp.getTime()
}

// Helper function to create a passenger priority queue
export const createPassengerQueue = (): PriorityQueue<PassengerPriority> => {
  return new PriorityQueue<PassengerPriority>(passengerComparator)
}

// Helper function to get priority level from passenger type
export const getPriorityLevel = (type: PassengerType): number => {
  const priorities = {
    vip: 1,
    elderly: 2, 
    regular: 3,
    standby: 4
  }
  return priorities[type]
}

// Helper function to create a passenger
export const createPassenger = (
  id: string,
  name: string,
  type: PassengerType,
  seatNumber?: string
): PassengerPriority => {
  return {
    id,
    name,
    type,
    seatNumber,
    timestamp: new Date(),
    priority: getPriorityLevel(type)
  }
}