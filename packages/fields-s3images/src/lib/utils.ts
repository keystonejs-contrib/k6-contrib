import { ImageExtension } from '@keystone-next/keystone/types';
import { ImagesData, ImageSize } from './types';

const IMAGE_REGEX = /^s3:image:([^\\\/:\n]+)\.(gif|jpg|png|webp):(sm|md|lg|full)$/;
const IMAGES_META_REGEX = /^s3:images:([^\\\/:\n]+):([^\\\/:\n]+)$/;

export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif'] as const;

export const ALIAS_IMAGE_EXTENSIONS_MAP: Record<string, typeof SUPPORTED_IMAGE_EXTENSIONS[number]> = {'jpeg': 'jpg'};

export const getImageMetaRef = (id: string, sizesMeta: any) => {
  const meta = Buffer.from(JSON.stringify(sizesMeta)).toString('base64');
  return `s3:images:${id}:${meta}`;
};

export const parseImagesMetaRef = (ref: string): ImagesData | undefined => {
  const match = ref.match(IMAGES_META_REGEX);
  if (match) {
    const [, id, meta] = match;
    try {
      const sizesMeta = JSON.parse(Buffer.from(meta, 'base64').toString());
      const { size,...data } = sizesMeta.full
      return {
        id,
        ...data,
        sizesMeta,
      };
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
  return undefined;
};

export const getImageRef = (id: string, size: ImageSize, extension: ImageExtension) =>
  `s3:image:${id}.${extension}:${size}`;

export const parseImageRef = (
  ref: string
): { id: string; extension: ImageExtension; size: ImageSize } | undefined => {
  const match = ref.match(IMAGE_REGEX);
  if (match) {
    const [, id, ext, size] = match;
    return {
      id,
      extension: ext as ImageExtension,
      size: size as ImageSize,
    };
  }
  return undefined;
};

const extensionsSet = new Set(SUPPORTED_IMAGE_EXTENSIONS);
export const isValidImageExtension = (extension: string): extension is ImageExtension => {
  return extensionsSet.has(extension as ImageExtension);
}

export const normalizeImageExtension = (extension: string): ImageExtension => {
  if (isValidImageExtension(extension)) {
    return extension;
  }
  return ALIAS_IMAGE_EXTENSIONS_MAP[extension] || undefined;
}