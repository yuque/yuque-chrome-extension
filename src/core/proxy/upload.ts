import { uploadFile } from '@/core/request';

export const uploadProxy = {
  async attach(file) {
    const { status, data } = await uploadFile(
      '/api/upload/attach',
      file,
    );
    if (status === 200) {
      return data;
    }
    throw new Error(`Error uploading image: ${(data as any).statusText}`);
  },
};
