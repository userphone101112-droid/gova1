/**
 * Vercel Blob Storage Helper
 * 
 * This module provides helper functions for interacting with Vercel Blob Storage.
 * Used for file uploads, image storage, and CDN integration.
 */

import { put, del, list } from '@vercel/blob';

export interface BlobUploadOptions {
  name: string;
  data: Buffer | string | File | Blob;
  contentType?: string;
  access?: 'public';
}

export interface BlobResult {
  url: string;
  downloadUrl: string;
  pathname: string;
  contentType: string;
  contentDisposition: string;
}

/**
 * Upload a file to Vercel Blob Storage
 */
export async function uploadToBlob(options: BlobUploadOptions): Promise<BlobResult> {
  const { name, data, contentType, access = 'public' } = options;
  const putOptions = contentType ? { access, contentType } : { access };

  const blob = await put(name, data, putOptions);

  return {
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    pathname: blob.pathname,
    contentType: blob.contentType,
    contentDisposition: blob.contentDisposition,
  };
}

/**
 * Delete a file from Vercel Blob Storage
 */
export async function deleteFromBlob(url: string): Promise<void> {
  await del(url);
}

/**
 * List all blobs in the storage
 */
export async function listBlobs(prefix?: string) {
  const options = prefix ? { prefix } : undefined;
  const { blobs } = await list(options);
  return blobs;
}

/**
 * Get a public URL for a blob
 */
export function getBlobUrl(pathname: string): string {
  return `https://${process.env.BLOB_READ_WRITE_TOKEN}@blob.vercel-storage.com/${pathname}`;
}
