
export interface IOrder {
    eventId: string
    userId: string
    total: number
    status: 'pending' | 'completed' | 'cancelled' | string
    items: { name: string; value: string | number }[]
    id: string
    orderDate: Date
  }
  
  // Enhanced Order Types
  
  export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'failed' | 'refunded'
  
  export interface OrderItem {
    type: 'ticket' | 'merchandise' | 'sponsorship'
    name: string
    quantity: number
    price: number
    subtotal: number
  }
  
  export interface Ticket {
    ticketId: string
    ticketNumber: string
    qrCodeUrl: string
    status: 'valid' | 'used' | 'cancelled'
    usedAt?: string
  }
  
  export interface Order {
    id: string
    userId: string
    eventId: string
    event?: {
      id: string
      name: string
      startDateTime: string
      location: any
    }
    items: OrderItem[]
    subtotal: number
    discount: number
    total: number
    status: OrderStatus
    couponCode?: string
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
    paymentMethod?: string
    paymentIntentId?: string
    tickets?: Ticket[]
    createdAt: string
    updatedAt: string
  }
  
  export interface OrderHistory {
    orders: Order[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    summary: {
      totalOrders: number
      totalSpent: number
      pendingOrders: number
      completedOrders: number
    }
  }
  
  