import { ImageExtension } from '@keystone-6/core/types';
import { AssetType } from './types';

const IMAGEREGEX = /^azure:image:([^\\\/:\n]+)\.(gif|jpg|png|webp)$/;
const FILEREGEX = /^azure:file:([^\\\/:\n]+)/;

export const getAzureStorageFileRef = (
  type: AssetType,
  nameOrId: string,
  extension: ImageExtension = 'png'
) => {
  if (type === 'file') return getFileRef(nameOrId);
  return getImageRef(nameOrId, extension);
};

export const getFileRef = (name: string) => `azure:file:${name}`;
export const parseFileRef = (ref: string): { type: 'file'; filename: string } | undefined => {
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

export const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'png', 'webp', 'gif'];

export const getImageRef = (id: string, extension: ImageExtension) =>
  `azure:image:${id}.${extension}`;

export const parseImageRef = (
  ref: string
): { type: 'image'; id: string; extension: ImageExtension } | undefined => {
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
