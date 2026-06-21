/**
 * Upstash Redis Helper
 * 
 * This module provides helper functions for interacting with Upstash Redis.
 * Used for caching, session storage, and rate limiting.
 * Replaces deprecated @vercel/kv
 */

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

/**
 * Get Redis client instance
 */
function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
  }
  return redis;
}

/**
 * Set a value in Redis with optional expiration
 */
export async function setKV<T>(key: string, value: T, ttl?: number): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (ttl) {
      await client.set(key, JSON.stringify(value), { ex: ttl });
    } else {
      await client.set(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error('Error setting value in Redis:', error);
    return false;
  }
}

/**
 * Get a value from Redis
 */
export async function getKV<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const value = await client.get<string>(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Error getting value from Redis:', error);
    return null;
  }
}

/**
 * Delete a value from Redis
 */
export async function deleteKV(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Error deleting value from Redis:', error);
    return false;
  }
}

/**
 * Check if a key exists in Redis
 */
export async function existsKV(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('Error checking key existence in Redis:', error);
    return false;
  }
}

/**
 * Set a value with expiration only if key doesn't exist
 */
export async function setNXKV<T>(key: string, value: T, ttl?: number): Promise<boolean> {
  try {
    const exists = await existsKV(key);
    if (exists) return false;

    await setKV(key, value, ttl);
    return true;
  } catch (error) {
    console.error('Error setting value with NX in Redis:', error);
    return false;
  }
}

/**
 * Increment a counter in Redis
 */
export async function incrementKV(key: string, amount: number = 1): Promise<number> {
  try {
    const client = getRedisClient();
    const result = await client.incrby(key, amount);
    return result;
  } catch (error) {
    console.error('Error incrementing value in Redis:', error);
    return 0;
  }
}

/**
 * Get multiple values from Redis
 */
export async function getMultipleKV<T>(keys: string[]): Promise<(T | null)[]> {
  try {
    const values = await getRedisClient().mget<string[]>(...keys);
    return values.map((v: string | null) => v ? JSON.parse(v) as T : null);
  } catch (error) {
    console.error('Error getting multiple values from Redis:', error);
    return keys.map(() => null);
  }
}

/**
 * Set multiple values in Redis
 */
export async function setMultipleKV<T>(entries: Record<string, T>, ttl?: number): Promise<boolean> {
  try {
    for (const [key, value] of Object.entries(entries)) {
      await setKV(key, value, ttl);
    }
    
    return true;
  } catch (error) {
    console.error('Error setting multiple values in Redis:', error);
    return false;
  }
}
