import { ImageExtension } from '@keystone-next/keystone/types';
import { ImageSize } from './types';

const IMAGEREGEX = /^s3:image:([^\\\/:\n]+)\.(gif|jpg|png|webp):(sm|md|lg|full)$/;

export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif'];

export const getImageRef = (id: string, size: ImageSize, extension: ImageExtension) =>
  `s3:image:${id}.${extension}:${size}`;

export const parseImageRef = (
  ref: string
): { id: string; extension: ImageExtension, size: ImageSize } | undefined => {
  const match = ref.match(IMAGEREGEX);
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
