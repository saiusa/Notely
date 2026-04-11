/**
 * Community Hooks
 * Custom React hooks for managing community-related state and operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import communityService from '../services/communityService.js';

/**
 * Hook to fetch all communities with pagination
 */
export function useCommunities(initialPage = 1) {
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCommunities, setTotalCommunities] = useState(0);
  const fetchControllerRef = useRef(null);

  const fetchCommunities = useCallback(async (page) => {
    // Cancel any previous requests
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    try {
      fetchControllerRef.current = new AbortController();
      const data = await communityService.getAllCommunities(page, 20);

      setCommunities(data.data);
      setCurrentPage(data.current_page);
      setTotalPages(data.last_page);
      setTotalCommunities(data.total);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch communities');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities(currentPage);

    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
    };
  }, []);

  return {
    communities,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCommunities,
    goToPage: (page) => fetchCommunities(page),
    refresh: () => fetchCommunities(currentPage),
  };
}

/**
 * Hook to fetch a single community
 */
export function useCommunity(communityId) {
  const [community, setCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!communityId) {
      setCommunity(null);
      return;
    }

    const fetchCommunity = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await communityService.getCommunity(communityId);
        setCommunity(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch community');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunity();
  }, [communityId]);

  return { community, isLoading, error };
}

/**
 * Hook to fetch categories with communities
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await communityService.getCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}

/**
 * Hook to fetch user's communities
 */
export function useMyCommunities() {
  const [myCommunities, setMyCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMyCommunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await communityService.getMyCommunities();
      setMyCommunities(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch your communities');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyCommunities();
  }, [fetchMyCommunities]);

  return { myCommunities, isLoading, error, refresh: fetchMyCommunities };
}

/**
 * Hook to manage community operations (join, leave, etc.)
 */
export function useCommunityActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const joinCommunity = useCallback(async (communityId) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await communityService.joinCommunity(communityId);
      setSuccessMessage(result.message || 'Successfully joined community');
      return result;
    } catch (err) {
      setError(err.message || 'Failed to join community');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const leaveCommunity = useCallback(async (communityId) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await communityService.leaveCommunity(communityId);
      setSuccessMessage(result.message || 'Successfully left community');
      return result;
    } catch (err) {
      setError(err.message || 'Failed to leave community');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    isLoading,
    error,
    successMessage,
    joinCommunity,
    leaveCommunity,
    clearMessages,
  };
}

/**
 * Hook to fetch community posts
 */
export function useCommunityPosts(communityId, initialPage = 1) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (page) => {
    if (!communityId) {
      setPosts([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await communityService.getCommunityPosts(communityId, page);
      setPosts(data.data);
      setCurrentPage(data.current_page);
      setTotalPages(data.last_page);
    } catch (err) {
      setError(err.message || 'Failed to fetch community posts');
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    if (communityId) {
      fetchPosts(currentPage);
    }
  }, [communityId, currentPage, fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    currentPage,
    totalPages,
    goToPage: (page) => setCurrentPage(page),
  };
}

/**
 * Hook to fetch community members
 */
export function useCommunityMembers(communityId, initialPage = 1) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);

  const fetchMembers = useCallback(async (page) => {
    if (!communityId) {
      setMembers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await communityService.getCommunityMembers(communityId, page);
      setMembers(data.data);
      setCurrentPage(data.current_page);
      setTotalPages(data.last_page);
      setTotalMembers(data.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch community members');
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    if (communityId) {
      fetchMembers(currentPage);
    }
  }, [communityId, currentPage, fetchMembers]);

  return {
    members,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalMembers,
    goToPage: (page) => setCurrentPage(page),
  };
}
