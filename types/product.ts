/**
 * @file types/product.ts
 * @description 쇼핑몰 관련 TypeScript 타입 정의
 *
 * shoppingmall_db.sql 스키마를 기반으로 정의된 타입들입니다.
 * - clerk_id를 직접 사용 (users 테이블 참조 없음)
 * - RLS 없이 애플리케이션 레벨에서 권한 관리
 */

// ============================================
// 상품 관련 타입
// ============================================

/**
 * 상품 정보 타입
 * Supabase products 테이블 스키마와 매칭
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 상품 카테고리 타입
 * 쇼핑몰에서 사용할 카테고리 목록
 */
export type ProductCategory =
  | "electronics"
  | "clothing"
  | "books"
  | "food"
  | "sports"
  | "beauty"
  | "home";

/**
 * 카테고리 정보 (라벨, 아이콘 등)
 */
export interface CategoryInfo {
  id: ProductCategory;
  label: string;
  icon: string;
  description: string;
}

/**
 * 상품 카테고리 목록
 */
export const PRODUCT_CATEGORIES: CategoryInfo[] = [
  {
    id: "electronics",
    label: "전자기기",
    icon: "💻",
    description: "스마트폰, 노트북, 태블릿 등",
  },
  {
    id: "clothing",
    label: "의류",
    icon: "👕",
    description: "남성복, 여성복, 아동복 등",
  },
  {
    id: "books",
    label: "도서",
    icon: "📚",
    description: "소설, 자기계발, 만화 등",
  },
  {
    id: "food",
    label: "식품",
    icon: "🍎",
    description: "신선식품, 가공식품, 음료 등",
  },
  {
    id: "sports",
    label: "스포츠",
    icon: "⚽",
    description: "운동용품, 아웃도어, 피트니스 등",
  },
  {
    id: "beauty",
    label: "뷰티",
    icon: "💄",
    description: "스킨케어, 메이크업, 향수 등",
  },
  {
    id: "home",
    label: "홈/리빙",
    icon: "🏠",
    description: "가구, 인테리어, 주방용품 등",
  },
];

/**
 * 상품 목록 조회 필터 옵션
 */
export interface ProductFilterOptions {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "name";
}

// ============================================
// 장바구니 관련 타입
// ============================================

/**
 * 장바구니 항목 타입
 * clerk_id로 사용자 식별 (users 테이블 참조 없음)
 */
export interface CartItem {
  id: string;
  clerk_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

/**
 * 장바구니 항목 + 상품 정보 조인
 */
export interface CartItemWithProduct extends CartItem {
  product: Product;
}

// ============================================
// 주문 관련 타입
// ============================================

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
