'use client';

import { useCallback, useRef, useState } from 'react';

import { IMAGE_UPLOAD_FORM, useTranslation } from '@/platform/ui';

type PreviewImage = {
  id: string;
  url: string;
};

export function ImageUploadFormContent() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [field3, setField3] = useState('');
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);

  const handleSelectImages = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const nextImages: PreviewImage[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      url: URL.createObjectURL(file),
    }));

    setPreviewImages((current) => [...current, ...nextImages]);
    event.target.value = '';
  }, []);

  return (
    <div
      className="mx-auto min-h-48 max-w-2xl space-y-6 bg-background px-4 py-8"
    >
      <label
        data-ui-uuid={IMAGE_UPLOAD_FORM.FORM.FIELD1_LABEL.uuid}
        htmlFor="image-upload-field1"
        className="block text-sm font-medium text-on-surface"
      >
        {t(IMAGE_UPLOAD_FORM.FORM.FIELD1_LABEL)}
      </label>
      <input
        id="image-upload-field1"
        data-ui-uuid={IMAGE_UPLOAD_FORM.FORM.FIELD1_INPUT.uuid}
        type="text"
        value={field1}
        onChange={(event) => setField1(event.target.value)}
        placeholder={t(IMAGE_UPLOAD_FORM.FORM.FIELD1_INPUT)}
        className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface placeholder:text-on-surface-variant"
      />

      <label
        data-ui-uuid={IMAGE_UPLOAD_FORM.FORM.FIELD2_LABEL.uuid}
        htmlFor="image-upload-field2"
        className="block text-sm font-medium text-on-surface"
      >
        {t(IMAGE_UPLOAD_FORM.FORM.FIELD2_LABEL)}
      </label>
      <input
        id="image-upload-field2"
        data-ui-uuid={IMAGE_UPLOAD_FORM.FORM.FIELD2_INPUT.uuid}
        type="text"
        value={field2}
        onChange={(event) => setField2(event.target.value)}
        placeholder={t(IMAGE_UPLOAD_FORM.FORM.FIELD2_INPUT)}
        className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface placeholder:text-on-surface-variant"
      />

      <label
        data-ui-uuid={IMAGE_UPLOAD_FORM.FORM.FIELD3_LABEL.uuid}
        htmlFor="image-upload-field3"
        className="block text-sm font-medium text-on-surface"
      >
        {t(IMAGE_UPLOAD_FORM.FORM.FIELD3_LABEL)}
      </label>
      <input
        id="image-upload-field3"
        data-ui-uuid={IMAGE_UPLOAD_FORM.FORM.FIELD3_INPUT.uuid}
        type="text"
        value={field3}
        onChange={(event) => setField3(event.target.value)}
        placeholder={t(IMAGE_UPLOAD_FORM.FORM.FIELD3_INPUT)}
        className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface placeholder:text-on-surface-variant"
      />

      <div
        className="grid grid-cols-2 gap-3 space-y-4 rounded-xl border border-outline-variant bg-surface-container p-4 sm:grid-cols-3"
      >
        <button
          type="button"
          data-ui-uuid={IMAGE_UPLOAD_FORM.GALLERY.SELECT_BUTTON.uuid}
          onClick={handleSelectImages}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary/90"
        >
          {t(IMAGE_UPLOAD_FORM.GALLERY.SELECT_BUTTON)}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          data-ui-uuid={IMAGE_UPLOAD_FORM.GALLERY.FILE_INPUT.uuid}
          onChange={handleFileChange}
          className="hidden"
          aria-label={t(IMAGE_UPLOAD_FORM.GALLERY.FILE_INPUT)}
        />
        {previewImages.map((image) => (
          <img
            key={image.id}
            data-ui-uuid={IMAGE_UPLOAD_FORM.GALLERY.PREVIEW_IMAGE.uuid}
            data-ui-instance-id={image.id}
            src={image.url}
            alt={t(IMAGE_UPLOAD_FORM.GALLERY.PREVIEW_IMAGE)}
            className="col-span-1 h-32 w-full rounded-lg border border-outline-variant object-cover"
          />
        ))}
      </div>
    </div>
  );
}
