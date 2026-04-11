/**
 * Community Type Definitions
 * Defines the structure for communities and categories in Notely
 */

export interface Community {
  community_id: number;
  category_id: number;
  name: string;
  description: string;
  image: string;
  members_count?: number;
  is_member?: boolean;
  created_at?: string;
  updated_at?: string | null;
}

export interface Category {
  category_id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  communities: Community[];
}

export interface CategoriesWithCommunities {
  [key: string]: Category;
}

export interface CreateCommunityPayload {
  category_id: number;
  name: string;
  description: string;
  image?: string;
}

export interface UpdateCommunityPayload {
  name?: string;
  description?: string;
  image?: string;
}

export interface CommunityResponse {
  community_id: number;
  category_id: number;
  name: string;
  description: string;
  image: string;
  members_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface PaginatedCommunities {
  data: CommunityResponse[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface JoinCommunityResponse {
  success: boolean;
  message: string;
  joined_at?: string;
}

export interface LeaveCommunityResponse {
  success: boolean;
  message: string;
}
