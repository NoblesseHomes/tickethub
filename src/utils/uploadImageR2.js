import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";

export default async function uploadImageR2(imageUrl, filename) {
  try {
    if (!imageUrl || !filename) throw new Error(`Отсутствуют нужные данные`);

    const response = await fetch(imageUrl);

    if (!response.ok)
      throw new Error(`Не удалось скачать файл. Статус: ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    });

    await r2Client.send(command);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
