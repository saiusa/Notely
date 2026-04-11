/**
 * Community Type Definitions (JSDoc version)
 * Defines the structure for communities and categories in Notely
 * 
 * @typedef {Object} Community
 * @property {number} community_id - Unique community identifier
 * @property {number} category_id - Parent category ID
 * @property {string} name - Community name
 * @property {string} description - Community description
 * @property {string} image - Community image URL
 * @property {number} [members_count] - Number of members (optional)
 * @property {boolean} [is_member] - Whether current user is member (optional)
 * @property {string} [created_at] - Creation timestamp (optional)
 * @property {string} [updated_at] - Last update timestamp (optional)
 */

/**
 * @typedef {Object} Category
 * @property {number} category_id - Unique category identifier
 * @property {string} name - Category name
 * @property {string} slug - URL-friendly slug
 * @property {string} [icon] - Category icon/emoji (optional)
 * @property {string} [color] - Hex color code (optional)
 * @property {string} [description] - Category description (optional)
 * @property {Community[]} communities - Array of communities in this category
 */

/**
 * @typedef {Object} CreateCommunityPayload
 * @property {number} category_id - Category this community belongs to
 * @property {string} name - Community name
 * @property {string} description - Community description
 * @property {string} [image] - Community image URL (optional)
 */

/**
 * @typedef {Object} UpdateCommunityPayload
 * @property {string} [name] - New community name (optional)
 * @property {string} [description] - New description (optional)
 * @property {string} [image] - New image URL (optional)
 */

/**
 * @typedef {Object} CommunityResponse
 * @property {number} community_id - Community ID
 * @property {number} category_id - Category ID
 * @property {string} name - Community name
 * @property {string} description - Community description
 * @property {string} image - Community image
 * @property {number} members_count - Number of members
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} PaginatedCommunities
 * @property {CommunityResponse[]} data - Array of communities
 * @property {number} current_page - Current page number
 * @property {number} last_page - Last page number
 * @property {number} per_page - Items per page
 * @property {number} total - Total community count
 */

/**
 * @typedef {Object} JoinCommunityResponse
 * @property {boolean} success - Whether join was successful
 * @property {string} message - Response message
 * @property {string} [joined_at] - Join timestamp (optional)
 */

/**
 * @typedef {Object} LeaveCommunityResponse
 * @property {boolean} success - Whether leave was successful
 * @property {string} message - Response message
 */
