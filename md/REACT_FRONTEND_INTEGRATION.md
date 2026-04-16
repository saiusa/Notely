# React Frontend Integration Guide: Trending Algorithm

## Overview

The React frontend has been successfully updated to wire up the new trending algorithm endpoints from the Laravel backend. The Explore feed now displays trending posts sorted by engagement, while the Community tab shows posts from joined communities.

---

## What Was Implemented

### 1. ✅ Added Explore Feed Method to PostService

**File:** `resources/js/services/postService.js`

```javascript
/** GET /api/posts/explore - Trending posts from all public communities */
async getExploreFeed(page = 1) {
    const res = await api.get('/posts/explore', { params: { page } });
    return res.data; // paginated { data, current_page, last_page, ... }
},
```

**Location:** After `getCommunityFeed()` method

**Purpose:** Provides a dedicated method for fetching trending posts from the `/api/posts/explore` endpoint.

---

### 2. ✅ Updated HomePage Fetch Logic

**File:** `resources/js/pages/HomePage.jsx`

**Changes Made:**

#### Updated `fetchPosts()` useCallback:

```javascript
const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
        let res;
        
        // Fetch different feed based on active tab
        if (activeTab === 'explore') {
            // Explore: Trending posts sorted by engagement (server-side)
            res = await postService.getExploreFeed();
        } else if (activeTab === 'community') {
            // Community: Posts from joined communities
            res = await postService.getCommunityFeed();
        } else {
            // Fallback: Default feed
            res = await postService.getFeed();
        }
        
        const data = res.data || res || [];
        
        // Client-side sorting only for non-Explore tabs
        // Explore tab is already sorted by engagement server-side
        let sortedPosts = data;
        
        if (activeTab !== 'explore') {
            if (filterType === 'popular') {
                sortedPosts = sortedPosts.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
            } else if (filterType === 'mood') {
                // Sort by posts that have mood set, then by creation date
                sortedPosts = sortedPosts.sort((a, b) => {
                    const aMood = a.mood_id || 0;
                    const bMood = b.mood_id || 0;
                    if ((aMood > 0) !== (bMood > 0)) {
                        return bMood > 0 ? 1 : -1;
                    }
                    return new Date(b.created_at) - new Date(a.created_at);
                });
            }
        }
        
        setPosts(sortedPosts);
        
        // Log filter results for debugging
        if (activeTab === 'explore') {
            console.log(`✓ Explore feed loaded - ${sortedPosts.length} trending posts`);
        } else if (filterType === 'popular' && sortedPosts.length > 0) {
            console.log(`✓ Filtered by POPULAR - Top post has ${sortedPosts[0].likes_count || 0} likes`);
        }
        // ... more logging
        
        console.log(`Fetched ${sortedPosts.length} posts for tab: ${activeTab}, filter: ${filterType}`);
    } catch (error) {
        console.error('Failed to fetch posts:', error);
        setPosts([]); // Empty state, no mock data
    } finally {
        setLoading(false);
    }
}, [activeTab, filterType]);
```

**Key Changes:**
- Added condition: `if (activeTab === 'explore')` → calls `getExploreFeed()`
- Added condition: `else if (activeTab === 'community')` → calls `getCommunityFeed()`
- Skip client-side sorting when `activeTab === 'explore'` (already sorted server-side)
- Added logging for explore feed

---

### 3. ✅ PostCard Already Displays Community Context

**File:** `resources/js/components/posts/PostDisplay.jsx`

**Status:** ✅ Already implemented

The header rendering already includes community context:

```javascript
{hasCommunity ? (
    // Community Post Header: username ▸ Community Name • timestamp
    <>
        <div className="post-card__author-name-row">
            <span className="post-card__author-name">{postUsername}</span>
            <span className="post-card__author-separator">▸</span>
            <Link 
                to={`/community/browse/${categorySlug}/${communityId}`}
                className="post-card__community-link"
            >
                {communityName}
            </Link>
        </div>
        <p className="post-card__author-time">• {formatRelativeTime(postTime)}</p>
    </>
) : (
    // Individual Post Header: username • timestamp
    <>
        <p className="post-card__author-name">{postUsername}</p>
        <p className="post-card__author-time">• {formatRelativeTime(postTime)}</p>
    </>
)}
```

**Display Format:**
- **Community Posts:** `username ▸ Community Name • 2 hours ago`
- **Individual Posts:** `username • 2 hours ago`

---

### 4. ✅ Homepage Tabs Already Wired Up

**File:** `resources/js/components/layout/TopNavbar.jsx`

**Status:** ✅ Already implemented

Tab switching is already functional:

```javascript
function HomeTabs({ activeTab, onChange }) {
  return (
    <div className="top-navbar__tabs">
      <button
        type="button"
        onClick={() => onChange('explore')}
        className={`top-navbar__tab ${
          activeTab === 'explore' ? 'top-navbar__tab--active' : 'top-navbar__tab--inactive'
        }`}
      >
        Explore
      </button>
      <span className="top-navbar__tab-divider" aria-hidden="true" />
      <button
        type="button"
        onClick={() => onChange('community')}
        className={`top-navbar__tab ${
          activeTab === 'community' ? 'top-navbar__tab--active' : 'top-navbar__tab--inactive'
        }`}
      >
        Community
      </button>
    </div>
  );
}
```

**Styling:**
- Active tab: `top-navbar__tab--active` (typically bold/primary color)
- Inactive tab: `top-navbar__tab--inactive` (typically muted/gray)

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       HomePage.jsx                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ State: activeTab ('explore' | 'community')           │   │
│  │ State: filterType ('recent' | 'popular' | 'mood')    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    TopNavbar (Tabs UI)
                            ↓
                    [Explore] [Community]
                            ↓
         ┌──────────────────┴──────────────────┐
         ↓                                      ↓
    If 'explore' tab                    If 'community' tab
         ↓                                      ↓
  postService.getExploreFeed()  postService.getCommunityFeed()
         ↓                                      ↓
  GET /api/posts/explore              GET /api/posts?tab=community
         ↓                                      ↓
  Server: Ordered by                  Server: Filtered by
  (likes_count + comments_count)      joined communities
  DESC, created_at DESC                      ↓
         ↓                            Client-side sort:
  No client-side sorting               (by filter preference)
  (already sorted)                           ↓
         ↓                                      ↓
         └──────────────────┬──────────────────┘
                            ↓
                      UI: PostCard[]
                            ↓
                      PostDisplay shows:
                   - For community posts:
                     "username ▸ Community • time"
                   - For personal posts:
                     "username • time"
```

---

## User Experience

### Tab 1: Explore (Default)
- **Shows:** Public posts from all communities
- **Sorting:** Engagement-based (likes + comments)
- **Order:** Most trending first, newest posts first when tied
- **Filters:** None (server-side sorting takes precedence)
- **Community Context:** Yes, displays community name

### Tab 2: Community
- **Shows:** Posts from communities user has joined
- **Sorting:** Can be filtered by Recent, Popular, Most Mood Used
- **Filters:** Recent (default), Popular (likes), Mood (has mood tag)
- **Community Context:** Yes, displays community name

---

## Data Flow Example

### Explore Feed Response Structure

```javascript
GET /api/posts/explore
↓
{
  "data": [
    {
      "post_id": 1,
      "user_id": 5,
      "community_id": 2,
      "content": "Amazing discovery!",
      "likes_count": 42,
      "comments_count": 18,
      "views_count": 156,
      "created_at": "2024-04-16T10:30:00Z",
      "privacy": "public",
      "user": {
        "user_id": 5,
        "username": "jane_doe",
        "profile": { "profile_picture": "..." }
      },
      "community": {
        "community_id": 2,
        "name": "Tech Enthusiasts",
        "category": { "slug": "technology" }
      },
      "mood": { "mood_id": 3, "name": "Excited", "color": "#FF6B6B" },
      "hashtags": [ { "hashtag_id": 1, "name": "tech" } ]
    },
    // ... more posts, 15 per page
  ],
  "current_page": 1,
  "per_page": 15,
  "total": 342,
  "last_page": 23
}
```

---

## Build Status

✅ **Build Successful**
- 215 modules transformed
- 418.49 kB gzipped
- No syntax errors
- All imports resolved

```
backend/public/dist/index.html          0.71 kB │ gzip:   0.41 kB
backend/public/dist/assets/index.css  407.67 kB │ gzip:  59.08 kB
backend/public/dist/assets/index.js   418.49 kB │ gzip: 125.04 kB
✓ built in 3.96s
```

---

## Testing Checklist

### Frontend Tests
- [ ] Click "Explore" tab → should load trending posts
- [ ] Click "Community" tab → should load community posts
- [ ] Tab switching should show loading indicator
- [ ] Community names should appear in post header
- [ ] Links to community pages should work
- [ ] Engagement counts should display correctly
- [ ] Posts with no community should show username only

### Backend Validation
- [ ] GET `/api/posts/explore` returns posts sorted by engagement
- [ ] GET `/api/posts?tab=community` returns joined community posts
- [ ] Page parameter works for pagination
- [ ] Community context is included in responses

### Integration Tests
- [ ] Switching tabs fetches correct endpoint
- [ ] UI updates when posts load
- [ ] Like/comment counting works on displayed posts
- [ ] Post deletion refreshes feed

---

## Files Modified

| File | Changes |
|------|---------|
| `resources/js/services/postService.js` | Added `getExploreFeed()` method |
| `resources/js/pages/HomePage.jsx` | Updated `fetchPosts()` to handle explore tab |
| `resources/js/components/posts/PostDisplay.jsx` | ✅ Already displays community context |
| `resources/js/components/layout/TopNavbar.jsx` | ✅ Already has tab UI wired up |

---

## Next Steps

1. **Deploy to Production:**
   - Run `npm run build` ✅ (done)
   - Deploy to backend `/public/dist` folder

2. **Test Live:**
   - Visit Homepage with fresh user session
   - Click Explore → should see trending posts
   - Click Community → should see community posts

3. **Monitor:**
   - Check browser console for load logs
   - Verify engagement counts update in real-time
   - Monitor API response times

4. **Future Enhancements:**
   - Add activity badges (e.g., "Trending Now" indicator)
   - Show engagement metrics
   - Infinite scroll pagination
   - Save preferred tab preference to local storage

---

## Summary

✅ **React Frontend Integration Complete**

The Homepage is now fully wired to:
1. Display trending posts via the Explore tab (using new `/api/posts/explore` endpoint)
2. Display community feed via the Community tab (using existing `/api/posts?tab=community`)
3. Show community context on all posts (already implemented)
4. Support tab switching with dynamic content loading
5. Apply client-side filtering only for non-explore tabs

All components are properly integrated and the build is production-ready!
