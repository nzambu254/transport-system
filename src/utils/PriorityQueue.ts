// utils/PriorityQueue.ts
export interface PassengerPriority {
  id: string
  vehicleId: string
  name: string
  type: 'vip' | 'elderly' | 'regular' | 'standby'
  arrivalTime: Date
  seatPreference?: string
  boardingTime?: Date
  status?: 'waiting' | 'boarding' | 'boarded'
  queuePosition: number
}

export class PriorityQueue<T extends PassengerPriority> {
  private heap: T[];
  private compare: (a: T, b: T) => number;

  constructor(compareFn: (a: T, b: T) => number) {
    this.heap = [];
    this.compare = compareFn;
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private left(i: number): number {
    return 2 * i + 1;
  }

  private right(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private heapifyUp(index: number): void {
    while (index > 0 &&
      this.compare(this.heap[index], this.heap[this.parent(index)]) < 0) {
      this.swap(index, this.parent(index));
      index = this.parent(index);
    }
  }

  private heapifyDown(index: number): void {
    let smallest = index;
    const left = this.left(index);
    const right = this.right(index);

    if (left < this.heap.length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
      smallest = left;
    }

    if (right < this.heap.length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
      smallest = right;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  enqueue(item: T): void {
    this.heap.push(item);
    this.heapifyUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop();
    if (!this.isEmpty()) {
      this.heapifyDown(0);
    }
    return item;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  clear(): void {
    this.heap = [];
  }

  toArray(): T[] {
    return [...this.heap].sort(this.compare);
  }
}

export function createPassengerQueue(): PriorityQueue<PassengerPriority> {
  // Priority order: vip > elderly > regular > standby
  // For same priority, earlier arrivalTime comes first
  return new PriorityQueue<PassengerPriority>((a, b) => {
    const priorityMap = { 'vip': 0, 'elderly': 1, 'regular': 2, 'standby': 3 };

    // First compare by status
    if (a.status === 'boarding') return -1;
    if (b.status === 'boarding') return 1;

    // Then compare by passenger type
    if (priorityMap[a.type] !== priorityMap[b.type]) {
      return priorityMap[a.type] - priorityMap[b.type];
    }

    // Finally compare by arrival time
    return a.arrivalTime.getTime() - b.arrivalTime.getTime();
  });
}