/**
 * @file types/product.ts
 * @description 상품 관련 TypeScript 타입 정의
 *
 * products 테이블 스키마를 기반으로 정의된 타입들입니다.
 */

/**
 * 상품 정보 타입
 * Supabase products 테이블 스키마와 매칭
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category: string | null;
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
  | "food"
  | "beauty"
  | "home"
  | "sports"
  | "books"
  | "toys";

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
    id: "food",
    label: "식품",
    icon: "🍎",
    description: "신선식품, 가공식품, 음료 등",
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
  {
    id: "sports",
    label: "스포츠",
    icon: "⚽",
    description: "운동용품, 아웃도어, 피트니스 등",
  },
  {
    id: "books",
    label: "도서",
    icon: "📚",
    description: "소설, 자기계발, 만화 등",
  },
  {
    id: "toys",
    label: "완구",
    icon: "🧸",
    description: "장난감, 게임, 취미용품 등",
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

