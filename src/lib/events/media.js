import uploadImageR2 from "@/utils/uploadImageR2";

export function extractSourceUrl(payload) {
  const photos = Array.isArray(payload.photos) ? payload.photos : [];
  const original = photos.find((photo) => photo?.type === "original");
  return original?.url || null;
}

export function extractPhotoFileName(sourceUrl) {
  if (!sourceUrl) return null;

  try {
    const pathname = new URL(sourceUrl).pathname;
    return pathname.split("/").pop() || null;
  } catch {
    return sourceUrl.split("/").pop() || null;
  }
}

export async function syncEventMedia({ tx, eventId, payload }) {
  const sourceUrl = extractSourceUrl(payload);
  if (!sourceUrl) return { skipped: true, reason: "no_source_url" };

  const fileName = extractPhotoFileName(sourceUrl);
  if (!fileName) return { skipped: true, reason: "no_file_name" };

  const existingMedia = await tx.media.findUnique({ where: { eventId } });

  if (!existingMedia) {
    await tx.media.create({
      data: {
        eventId,
        sourceUrl,
      },
    });
  } else if (existingMedia.sourceUrl !== sourceUrl) {
    await tx.media.update({
      where: { eventId },
      data: { sourceUrl },
    });
  }

  if (existingMedia?.s3Key === fileName) {
    return { skipped: true, reason: "same_file_name", fileName };
  }

  const uploadResult = await uploadImageR2(sourceUrl, fileName);
  if (!uploadResult.success) {
    throw new Error(uploadResult.error || "R2 upload failed");
  }

  await tx.media.update({
    where: { eventId },
    data: {
      s3Key: fileName,
    },
  });

  return { uploaded: true, fileName };
}
