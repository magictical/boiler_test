/**
 * @file types/product.ts
 * @description 상품 관련 TypeScript 타입 정의
 *
 * 상품, 카테고리, 장바구니 등 상품 관련 모든 타입들을 정의합니다.
 */

// ============================================
// 상품 관련 타입
// ============================================

/**
 * 상품 카테고리 타입
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
 * 카테고리 정보 타입
 */
export interface CategoryInfo {
  id: ProductCategory;
  label: string;
  icon: string;
  description: string;
}

/**
 * 상품 정보 타입
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category: ProductCategory | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 상품 필터 옵션 타입
 */
export interface ProductFilterOptions {
  category?: ProductCategory;
  isActive?: boolean;
  search?: string;
}

/**
 * 상품 정렬 옵션 타입
 */
export type ProductSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc";

/**
 * 상품 카테고리 목록
 */
export const PRODUCT_CATEGORIES: CategoryInfo[] = [
  {
    id: "electronics",
    label: "전자제품",
    icon: "💻",
    description: "최신 전자제품과 가젯",
  },
  {
    id: "clothing",
    label: "의류",
    icon: "👕",
    description: "패션 아이템과 의류",
  },
  {
    id: "books",
    label: "도서",
    icon: "📚",
    description: "책과 학습 자료",
  },
  {
    id: "food",
    label: "식품",
    icon: "🍎",
    description: "신선한 식품과 음료",
  },
  {
    id: "sports",
    label: "스포츠",
    icon: "⚽",
    description: "스포츠 용품과 운동 기구",
  },
  {
    id: "beauty",
    label: "뷰티",
    icon: "💄",
    description: "화장품과 미용 제품",
  },
  {
    id: "home",
    label: "홈/리빙",
    icon: "🏠",
    description: "집 꾸미기와 생활 용품",
  },
];

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
 * 장바구니 항목 + 상품 정보 조인 타입
 */
export interface CartItemWithProduct extends CartItem {
  products: Product; // Supabase JOIN 결과
}

/**
 * 장바구니 Server Action 반환 타입
 */
export interface CartActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 장바구니 조회 반환 타입
 */
export interface GetCartResult {
  data?: CartItemWithProduct[];
  error?: string;
}

/**
 * 장바구니 아이템 개수 조회 반환 타입
 */
export interface GetCartItemCountResult {
  count: number;
  error?: string;
}
