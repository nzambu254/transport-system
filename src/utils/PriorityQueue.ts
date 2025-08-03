export interface PassengerPriority {
  id: string
  name: string
  type: 'vip' | 'elderly' | 'regular' | 'standby'
  arrivalTime: Date
  seatPreference?: string
  boardingTime?: Date
  queuePosition?: number
  status?: 'waiting' | 'boarding' | 'boarded' | 'cancelled'
}

export class PriorityQueue<T> {
  private heap: T[] = []
  private compare: (a: T, b: T) => number

  constructor(compareFn: (a: T, b: T) => number) {
    this.compare = compareFn
  }

  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2)
  }

  private getLeftChildIndex(index: number): number {
    return 2 * index + 1
  }

  private getRightChildIndex(index: number): number {
    return 2 * index + 2
  }

  private hasParent(index: number): boolean {
    return this.getParentIndex(index) >= 0
  }

  private hasLeftChild(index: number): boolean {
    return this.getLeftChildIndex(index) < this.heap.length
  }

  private hasRightChild(index: number): boolean {
    return this.getRightChildIndex(index) < this.heap.length
  }

  private parent(index: number): T {
    return this.heap[this.getParentIndex(index)]
  }

  private leftChild(index: number): T {
    return this.heap[this.getLeftChildIndex(index)]
  }

  private rightChild(index: number): T {
    return this.heap[this.getRightChildIndex(index)]
  }

  private swap(index1: number, index2: number): void {
    const temp = this.heap[index1]
    this.heap[index1] = this.heap[index2]
    this.heap[index2] = temp
  }

  private heapifyUp(): void {
    let index = this.heap.length - 1
    while (this.hasParent(index) && this.compare(this.heap[index], this.parent(index)) < 0) {
      this.swap(this.getParentIndex(index), index)
      index = this.getParentIndex(index)
    }
  }

  private heapifyDown(): void {
    let index = 0
    while (this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index)
      if (this.hasRightChild(index) && this.compare(this.rightChild(index), this.leftChild(index)) < 0) {
        smallerChildIndex = this.getRightChildIndex(index)
      }

      if (this.compare(this.heap[index], this.heap[smallerChildIndex]) < 0) {
        break
      } else {
        this.swap(index, smallerChildIndex)
      }
      index = smallerChildIndex
    }
  }

  enqueue(item: T): void {
    this.heap.push(item)
    this.heapifyUp()
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined
    
    const item = this.heap[0]
    this.heap[0] = this.heap[this.heap.length - 1]
    this.heap.pop()
    this.heapifyDown()
    return item
  }

  peek(): T | undefined {
    if (this.heap.length === 0) return undefined
    return this.heap[0]
  }

  size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  toArray(): T[] {
    return [...this.heap]
  }

  clear(): void {
    this.heap = []
  }
}

// Passenger priority comparison function
export const passengerComparator = (a: PassengerPriority, b: PassengerPriority): number => {
  const priorityMap = {
    vip: 1,
    elderly: 2,
    regular: 3,
    standby: 4
  }

  const aPriority = priorityMap[a.type]
  const bPriority = priorityMap[b.type]

  // Primary sort by priority
  if (aPriority !== bPriority) {
    return aPriority - bPriority
  }

  // Secondary sort by arrival time (FIFO for same priority)
  return a.arrivalTime.getTime() - b.arrivalTime.getTime()
}

// Create a passenger priority queue
export const createPassengerQueue = (): PriorityQueue<PassengerPriority> => {
  return new PriorityQueue<PassengerPriority>(passengerComparator)
}