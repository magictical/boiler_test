/**
 * @file types/order.ts
 * @description 주문 관련 TypeScript 타입 정의
 *
 * 주문 생성, 조회, 관리에 필요한 모든 타입들을 정의합니다.
 */

// ============================================
// 주문 관련 타입
// ============================================

/**
 * 배송 주소 타입 (JSONB)
 */
export interface ShippingAddress {
  name: string;
  phone: string;
  zipCode: string;
  address: string;
  detailAddress?: string;
}

/**
 * 주문 상태 타입
 */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

/**
 * 주문 정보 타입
 * clerk_id로 사용자 식별
 */
export interface Order {
  id: string;
  clerk_id: string;
  total_amount: number;
  status: OrderStatus;
  shipping_address: ShippingAddress | null;
  order_note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 주문 상세 항목 타입
 * product_name을 비정규화하여 저장 (주문 시점의 상품명 보존)
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

/**
 * 주문 + 주문 상세 항목 조인
 */
export interface OrderWithItems extends Order {
  items: OrderItem[];
}

/**
 * 주문 폼 입력 데이터 (Zod 스키마)
 */
export interface OrderFormData {
  name: string;
  phone: string;
  zipCode: string;
  address: string;
  detailAddress?: string;
  orderNote?: string;
}

/**
 * 주문 생성 Server Action 반환 타입
 */
export interface CreateOrderResult {
  success: boolean;
  error?: string;
  orderId?: string;
}

/**
 * 주문 조회 Server Action 반환 타입
 */
export interface GetOrderResult {
  data?: OrderWithItems;
  error?: string;
}

/**
 * 사용자 주문 목록 조회 Server Action 반환 타입
 */
export interface GetUserOrdersResult {
  data?: Order[];
  error?: string;
}
