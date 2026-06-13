export type Tag = {
  id: string;
  name: string;
};

export type GalleryImage = {
  id: string;
  storage_path: string;
  file_name: string;
  created_at: string;
  tags: Tag[];
  url: string | null; // signed URL for display
};
