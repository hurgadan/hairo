import { Readable } from "node:stream";

import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AppConfig, StorageConfig } from "../../_common/types";
import { DEFAULT_SIGNED_URL_TTL_SECONDS } from "../constants";

export interface PutObjectParams {
  key: string;
  body: Buffer | Readable | Uint8Array | string;
  contentType?: string;
}

/**
 * Инфраструктурная обёртка над S3-совместимым хранилищем (MinIO локально, R2/S3 в проде).
 * Все доменные модули (photos, generation, catalog) работают с хранилищем только через неё.
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly config: StorageConfig;

  constructor(configService: ConfigService<AppConfig, true>) {
    this.config = configService.get("storage", { infer: true });

    this.client = new S3Client({
      region: this.config.region,
      endpoint: this.config.endpoint,
      forcePathStyle: this.config.forcePathStyle,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  /** В dev (MinIO) создаём бакет автоматически; в проде бакет заводится заранее. */
  public async onModuleInit(): Promise<void> {
    if (!this.config.forcePathStyle) {
      return;
    }

    try {
      await this.client.send(
        new HeadBucketCommand({ Bucket: this.config.bucket }),
      );
    } catch {
      await this.client.send(
        new CreateBucketCommand({ Bucket: this.config.bucket }),
      );
      this.logger.log(`Created storage bucket "${this.config.bucket}"`);
    }
  }

  public async putObject({
    key,
    body,
    contentType,
  }: PutObjectParams): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  public async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
    );
  }

  public async objectExists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.config.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  /** Presigned URL для клиентской загрузки напрямую в хранилище (browser → S3). */
  public getSignedUploadUrl(
    key: string,
    contentType?: string,
    ttlSeconds: number = DEFAULT_SIGNED_URL_TTL_SECONDS,
  ): Promise<string> {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ContentType: contentType,
      }),
      {
        expiresIn: ttlSeconds,
        // Content-Type должен входить в подпись, иначе строгий S3/R2 отклонит PUT.
        signableHeaders: contentType ? new Set(["content-type"]) : undefined,
      },
    );
  }

  /** Presigned URL для скачивания приватного объекта. */
  public getSignedDownloadUrl(
    key: string,
    ttlSeconds: number = DEFAULT_SIGNED_URL_TTL_SECONDS,
  ): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
      { expiresIn: ttlSeconds },
    );
  }

  /**
   * Публичный URL объекта через CDN (`STORAGE_PUBLIC_URL`).
   * Возвращает `null`, если публичная отдача не сконфигурирована — тогда используем presigned URL.
   */
  public getPublicUrl(key: string): string | null {
    if (!this.config.publicUrl) {
      return null;
    }

    return `${this.config.publicUrl.replace(/\/$/, "")}/${key}`;
  }
}
