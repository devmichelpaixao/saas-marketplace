export interface Product {
  id: string
  sku: string
  name: string
  description: string
  cost: number
  price: number
  stock: number
  physicalStock: number
  barcode?: string
  active: boolean
  categoryId?: string
  productGroupId?: string
  departmentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  barcode?: string
  status: OrderStatus
  totalAmount: number
  shippingAmount: number
  discountAmount: number
  customerName: string
  customerEmail?: string
  customerPhone?: string
  currentDepartmentId?: string
  createdAt: Date
  updatedAt: Date
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  READY_TO_SHIP = 'READY_TO_SHIP',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Department {
  id: string
  name: string
  description?: string
  order: number
  color?: string
  active: boolean
}

export interface Task {
  id: string
  title: string
  description?: string
  dueDate: Date
  priority: TaskPriority
  status: TaskStatus
  orderId?: string
  departmentId?: string
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
