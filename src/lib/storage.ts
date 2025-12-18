// Server-side only file storage utility with local and S3 support
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local';
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// S3 Client (lazy initialization)
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
    if (!s3Client) {
        s3Client = new S3Client({
            region: process.env.S3_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
            endpoint: process.env.S3_ENDPOINT || undefined,
            forcePathStyle: !!process.env.S3_ENDPOINT, // Required for Supabase/MinIO
        });
    }
    return s3Client;
}

export interface UploadResult {
    url: string;
    key: string;
}

export async function uploadFile(
    file: Buffer,
    originalName: string,
    folder: string = 'general'
): Promise<UploadResult> {
    const ext = originalName.split('.').pop() || 'bin';
    const key = `${folder}/${uuidv4()}.${ext}`;

    if (STORAGE_TYPE === 's3') {
        return uploadToS3(file, key, getMimeType(ext));
    } else {
        return uploadToLocal(file, key);
    }
}

async function uploadToLocal(file: Buffer, key: string): Promise<UploadResult> {
    const filePath = join(UPLOAD_DIR, key);
    const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));

    // Ensure directory exists
    await mkdir(dirPath, { recursive: true });

    // Write file
    await writeFile(filePath, file);

    return {
        url: `/uploads/${key}`,
        key,
    };
}

async function uploadToS3(file: Buffer, key: string, contentType: string): Promise<UploadResult> {
    const client = getS3Client();
    const bucket = process.env.S3_BUCKET!;

    await client.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file,
            ContentType: contentType,
        })
    );

    // Construct URL based on S3 endpoint type
    const endpoint = process.env.S3_ENDPOINT;
    let url: string;

    if (endpoint) {
        // For Supabase or custom S3 endpoints
        url = `${endpoint}/object/public/${bucket}/${key}`;
    } else {
        // Standard AWS S3
        url = `https://${bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`;
    }

    return { url, key };
}

export async function deleteFile(key: string): Promise<void> {
    if (STORAGE_TYPE === 's3') {
        const client = getS3Client();
        await client.send(
            new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET!,
                Key: key,
            })
        );
    } else {
        // For local, we could delete the file but keeping it simple for MVP
        console.log(`Would delete local file: ${key}`);
    }
}

function getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        mp4: 'video/mp4',
        webm: 'video/webm',
        mov: 'video/quicktime',
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

// Re-export client-safe utilities
export { extractYouTubeId, getYouTubeThumbnail, getSocialLinkThumbnail } from './utils';
