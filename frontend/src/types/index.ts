export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum EventType {
  WEDDING = 'WEDDING',
  SEMINAR = 'SEMINAR',
  BIRTHDAY = 'BIRTHDAY',
  CORPORATE = 'CORPORATE',
  OTHER = 'OTHER',
}

export enum EventStatus {
  PENDING = 'PENDING',
  QUOTED = 'QUOTED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum DevisStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: Role;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
    events: number;
    reviews: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  plats?: Plat[];
}

export interface Plat {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  allergens: string[];
  available: boolean;
  stockQuantity: number;
  preparationTime?: number;
  categoryId: string;
  category?: Category;
  isPlatDuJour?: boolean;
  createdAt: string;
  updatedAt: string;
  reviews?: Review[];
  _count?: {
    reviews: number;
    orderItems: number;
  };
  averageRating?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  platId: string;
  quantity: number;
  unitPrice: number;
  plat?: Plat;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  items: OrderItem[];
  invoice?: Invoice;
}

export interface Event {
  id: string;
  userId: string;
  eventType: EventType;
  title: string;
  eventDate: string;
  guestCount: number;
  venue?: string;
  notes?: string;
  budget?: number;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  user?: User;
  devis?: Devis[];
}

export interface DevisItem {
  id: string;
  devisId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Devis {
  id: string;
  devisNumber: string;
  eventId: string;
  totalAmount: number;
  validUntil: string;
  status: DevisStatus;
  notes?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  event?: Event;
  items: DevisItem[];
  invoice?: Invoice;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: string;
  orderId?: string;
  devisId?: string;
  amount: number;
  pdfUrl?: string;
  status: InvoiceStatus;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  order?: Order;
  devis?: Devis;
}

export interface Review {
  id: string;
  userId: string;
  platId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  plat?: Plat;
}

export interface CartItem {
  plat: Plat;
  quantity: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  status: number;
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalClients: number;
  totalEvents: number;
  ordersByStatus: { status: OrderStatus; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  topPlats: { plat: Plat; totalSold: number; revenue: number }[];
  recentOrders: Order[];
}

export interface ProductionBoardOrder extends Order {
  workloadPoints: number;
  slotLabel: string;
}

export interface ProductionBoardLane {
  status: OrderStatus;
  label: string;
  orders: ProductionBoardOrder[];
}

export interface ProductionSlotWorkload {
  slot: string;
  ordersCount: number;
  workloadPoints: number;
  capacity: number;
  isOverCapacity: boolean;
}

export interface ProductionBoardData {
  range: {
    from: string;
    to: string;
    windowDays: number;
    mode: 'active' | 'range';
  };
  summary: {
    totalOrders: number;
    backlogCount: number;
    slotCapacity: number;
    overloadedSlots: number;
  };
  lanes: ProductionBoardLane[];
  slotWorkload: ProductionSlotWorkload[];
}
