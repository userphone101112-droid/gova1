export type StorageSubfolder = {
  name: string;
  description?: string;
};

export type StorageFolder = {
  name: string;
  description?: string;
  subfolders: StorageSubfolder[];
};

export type StorageRefFile = {
  folders: StorageFolder[];
};
