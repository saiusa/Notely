# Notely Communities & Categories System Documentation

## Overview

The Communities & Categories system for Notely is a comprehensive journaling community platform with 6 main categories containing 31 unique communities. This document outlines the complete integration between the frontend React application and Laravel backend.

## System Architecture

### Frontend Structure

#### 1. **Type Definitions** (`resources/js/types/community.ts`)
- `Community` - Individual community data
- `Category` - Category with communities array
- `CreateCommunityPayload` - Data for creating new communities
- `UpdateCommunityPayload` - Data for updating communities
- `PaginatedCommunities` - Paginated response structure

#### 2. **Data Constants** (`resources/js/constants/communitiesData.ts`)
- `CATEGORIES_DATA` - Array of all categories with nested communities
- `COMMUNITIES_MAP` - Quick lookup map by community ID
- `COMMUNITIES_BY_SLUG` - Lookup map by community slug
- `generateSeedData()` - Function to generate backend seed data

#### 3. **Service Layer** (`resources/js/services/communityService.ts`)
RESTful API client for CRUD operations:
- `getAllCommunities(page, perPage)` - Fetch paginated communities
- `getCommunity(id)` - Fetch single community
- `createCommunity(payload)` - Create new community
- `updateCommunity(id, payload)` - Update community
- `deleteCommunity(id)` - Delete community
- `joinCommunity(id)` - Join a community
- `leaveCommunity(id)` - Leave a community
- `getMyCommunities()` - Get user's joined communities
- `getCommunityMembers(id, page)` - Get community members
- `getCommunityPosts(id, page)` - Get community posts
- `getCategories()` - Fetch all categories
- `getCategory(id)` - Fetch single category

#### 4. **React Hooks** (`resources/js/hooks/useCommunity.ts`)

**`useCommunities(initialPage)`**
```jsx
const { communities, isLoading, error, currentPage, totalPages, goToPage, refresh } = useCommunities();
```

**`useCommunity(communityId)`**
```jsx
const { community, isLoading, error } = useCommunity(communityId);
```

**`useCategories()`**
```jsx
const { categories, isLoading, error } = useCategories();
```

**`useMyCommunities()`**
```jsx
const { myCommunities, isLoading, error, refresh } = useMyCommunities();
```

**`useCommunityActions()`**
```jsx
const { isLoading, error, successMessage, joinCommunity, leaveCommunity, clearMessages } = useCommunityActions();
```

**`useCommunityPosts(communityId, initialPage)`**
```jsx
const { posts, isLoading, error, currentPage, totalPages, goToPage } = useCommunityPosts(communityId);
```

**`useCommunityMembers(communityId, initialPage)`**
```jsx
const { members, isLoading, error, currentPage, totalPages, totalMembers, goToPage } = useCommunityMembers(communityId);
```

### Backend Structure

#### 1. **Models**

**Category Model** (`backend/app/Models/Category.php`)
- `category_id` (primary key)
- `name` - Category name
- `slug` - URL-friendly slug
- `icon` - Emoji or icon
- `color` - Hex color code
- `description` - Category description
- Relationship: `communities()` - Has many communities

**Community Model** (`backend/app/Models/Community.php`)
- `community_id` (primary key)
- `category_id` (foreign key) - Belongs to category
- `name` - Community name
- `description` - Community description
- `image` - Community image URL
- Relationships:
  - `category()` - Belongs to category
  - `communityMembers()` - Has many members
  - `users()` - Belongs to many users

#### 2. **Controllers**

**CategoryController** (`backend/app/Http/Controllers/Api/CategoryController.php`)
- `index()` - GET `/api/categories` - All categories with communities
- `show(Category)` - GET `/api/categories/{id}` - Single category with communities
- `withCounts()` - GET `/api/categories/with-counts` - Categories with member counts

**CommunityController** (`backend/app/Http/Controllers/Api/CommunityController.php`)
- `index()` - GET `/api/communities` - Paginated communities
- `store(Request)` - POST `/api/communities` - Create community
- `show(Community)` - GET `/api/communities/{id}` - Get community
- `posts(Community)` - GET `/api/communities/{id}/posts` - Community posts

#### 3. **Database Migrations**

**Create Categories Table**
```sql
CREATE TABLE categories (
    category_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    icon VARCHAR(255),
    color VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP
);
```

**Add category_id to Communities Table**
```sql
ALTER TABLE communities ADD COLUMN category_id BIGINT NULLABLE;
ALTER TABLE communities ADD FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL;
```

#### 4. **Seeder** (`database/seeders/CategorySeeder.php`)
Populates the database with all 6 categories and 31 communities with realistic member counts.

Run with:
```bash
php artisan db:seed --class=CategorySeeder
```

## Category Hierarchy

### 1. **Gratitude** (Category ID: 1)
- 🙏 Yellow (#FFD700)
- Communities: 5
  - Morning Gratitude (12,450 members)
  - Small Wins Today (8,920 members)
  - Unexpected Blessings (6,780 members)
  - Gratitude for Hard Times (5,420 members)
  - Letters of Appreciation (4,950 members)

### 2. **Healing Era** (Category ID: 2)
- 🌱 Green (#98FF98)
- Communities: 6
  - Letters I'll Never Send (14,230 members)
  - Things I'm Letting Go (11,890 members)
  - Shadow Work (8,340 members)
  - Dear Younger Me (9,670 members)
  - Progress Not Perfection (13,560 members)
  - Recovery Journey (10,230 members)

### 3. **Manifestation** (Category ID: 3)
- ✨ Pink (#FF69B4)
- Communities: 6
  - Vision Board Journal (15,420 members)
  - Scripting My Dream Life (12,780 members)
  - Affirmations (16,890 members)
  - Future Self Letters (9,560 members)
  - Monthly Intentions (11,340 members)
  - Manifestation Wins (7,890 members)

### 4. **Personal Growth** (Category ID: 4)
- 📈 Sky Blue (#87CEEB)
- Communities: 5
  - Habit Tracker Journal (18,950 members)
  - Reading Log (8,760 members)
  - Mistakes & Lessons (10,450 members)
  - Career Goals (7,230 members)
  - Weekly Reviews (13,670 members)

### 5. **Poetry** (Category ID: 5)
- 📝 Plum (#DDA0DD)
- Communities: 3
  - Love Poems (9,870 members)
  - Heartbreak Verses (8,450 members)
  - Midnight Thoughts in Verse (6,890 members)

### 6. **Dark Academia** (Category ID: 6)
- 🎓 Brown (#8B4513)
- Communities: 4
  - Philosophical Musings (7,340 members)
  - Late Night Thoughts (10,230 members)
  - Coffee Shop Observations (5,670 members)
  - Film & Cinema Notes (6,890 members)

## API Endpoints

### Categories
- `GET /api/categories` - List all categories with communities
- `GET /api/categories/with-counts` - Categories with member counts
- `GET /api/categories/:id` - Single category with communities

### Communities
- `GET /api/communities` - Paginated list of all communities
- `POST /api/communities` - Create new community (admin only)
- `GET /api/communities/:id` - Get community details
- `GET /api/communities/:id/posts` - Community posts (paginated)
- `GET /api/communities/:id/members` - Community members (paginated)
- `POST /api/communities/:id/join` - Join community
- `DELETE /api/communities/:id/leave` - Leave community
- `GET /api/communities/me` - Get user's communities

## Frontend Usage Examples

### Display all categories with communities
```jsx
import { useCategories } from '@/hooks/useCommunity';

function CategoriesView() {
  const { categories, isLoading, error } = useCategories();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {categories.map((category) => (
        <div key={category.category_id}>
          <h2>{category.icon} {category.name}</h2>
          {category.communities.map((community) => (
            <div key={community.community_id}>
              <h3>{community.name}</h3>
              <p>{community.description}</p>
              <p>{community.members_count} members</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Display paginated communities
```jsx
import { useCommunities } from '@/hooks/useCommunity';

function CommunitiesList() {
  const { communities, isLoading, currentPage, totalPages, goToPage } = useCommunities();

  return (
    <div>
      {communities.map((community) => (
        <div key={community.community_id}>
          <h3>{community.name}</h3>
          <p>{community.members_count} members</p>
        </div>
      ))}
      <div>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button key={page} onClick={() => goToPage(page)}>
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Join/Leave a community
```jsx
import { useCommunityActions } from '@/hooks/useCommunity';

function CommunityJoinButton({ communityId }) {
  const { isLoading, joinCommunity, successMessage, error } = useCommunityActions();

  const handleJoin = async () => {
    try {
      await joinCommunity(communityId);
    } catch (err) {
      console.error('Failed to join:', err);
    }
  };

  return (
    <div>
      <button onClick={handleJoin} disabled={isLoading}>
        {isLoading ? 'Joining...' : 'Join Community'}
      </button>
      {successMessage && <p>{successMessage}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

## Installation & Setup

### Backend Setup
```bash
# Run migrations
php artisan migrate

# Seed categories and communities
php artisan db:seed --class=CategorySeeder
```

### Frontend Integration
1. Import hooks and services as needed
2. Use the provided type definitions for TypeScript
3. Call API endpoints through the service layer
4. Handle loading and error states appropriately

## Data Consistency Notes

- All community IDs are prefixed with their category ID (e.g., Gratitude communities are 101-105)
- All descriptions are welcoming and inspiring, fitting Notely's journaling vibe
- Member counts are realistic and varied (500-75,000 range)
- Images use placeholder paths that can be replaced with actual images later
- Categories are ordered chronologically by creation

## Future Enhancements

- [ ] Community search and filtering
- [ ] Community recommendations based on user preferences
- [ ] Custom community creation by users
- [ ] Community moderation tools
- [ ] Community event scheduling
- [ ] Featured communities carousel
- [ ] Community insights and analytics
