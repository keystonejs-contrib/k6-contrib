import { type ImageExtension as KeystoneImageExtension } from '@keystone-6/core/types';
import { AssetType } from './types';

const IMAGEREGEX = /^s3:image:([^\\\/:\n]+)\.(gif|jpg|png|webp)$/;
const FILEREGEX = /^s3:file:([^\\\/:\n]+)/;

type ImageExtension = KeystoneImageExtension | 'svg';

export const getS3FileRef = (type: AssetType, nameOrId: string, extension: ImageExtension = 'png') => {
  if (type === 'file') return getFileRef(nameOrId)
  return getImageRef(nameOrId, extension);
}


export const getFileRef = (name: string) => `s3:file:${name}`;
export const parseFileRef = (ref: string): { type: 'file', filename: string; } | undefined => {
  const match = ref.match(FILEREGEX);
  if (match) {
    const [, filename] = match;
    return {
      type: 'file',
      filename: filename as string,
    };
  }
  return undefined;
};

export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif', 'svg'] as const;

export const ALIAS_IMAGE_EXTENSIONS_MAP: Record<string, typeof SUPPORTED_IMAGE_EXTENSIONS[number]> = {'jpeg': 'jpg'};

export const getImageRef = (id: string, extension: ImageExtension) =>
  `s3:image:${id}.${extension}`;

export const parseImageRef = (
  ref: string
): { type: 'image', id: string; extension: ImageExtension } | undefined => {
  const match = ref.match(IMAGEREGEX);
  if (match) {
    const [, id, ext] = match;
    return {
      type: 'image',
      id,
      extension: ext as ImageExtension,
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
