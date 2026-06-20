'use client';

import { useCallback, useRef, useState } from 'react';

import { TEST1, useTranslation } from '@/platform/ui';

type PreviewImage = {
  id: string;
  url: string;
};

export function Test1Content() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input3, setInput3] = useState('');
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
      data-ui-uuid={TEST1.PAGE.CONTAINER.uuid}
      className="mx-auto min-h-48 max-w-2xl space-y-6 bg-background px-4 py-8"
    >
      <h1
        data-ui-uuid={TEST1.PAGE.TITLE.uuid}
        className="text-2xl font-bold text-on-surface"
      >
        {t(TEST1.PAGE.TITLE)}
      </h1>

      <div
        data-ui-uuid={TEST1.FORM.CONTAINER.uuid}
        className="space-y-4"
      >
        <input
          id="test1-input1"
          data-ui-uuid={TEST1.FORM.INPUT_1.uuid}
          type="text"
          value={input1}
          onChange={(event) => setInput1(event.target.value)}
          placeholder={t(TEST1.FORM.INPUT_1)}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface placeholder:text-on-surface-variant"
        />

        <input
          id="test1-input2"
          data-ui-uuid={TEST1.FORM.INPUT_2.uuid}
          type="text"
          value={input2}
          onChange={(event) => setInput2(event.target.value)}
          placeholder={t(TEST1.FORM.INPUT_2)}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface placeholder:text-on-surface-variant"
        />

        <input
          id="test1-input3"
          data-ui-uuid={TEST1.FORM.INPUT_3.uuid}
          type="text"
          value={input3}
          onChange={(event) => setInput3(event.target.value)}
          placeholder={t(TEST1.FORM.INPUT_3)}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface placeholder:text-on-surface-variant"
        />
      </div>

      <div
        data-ui-uuid={TEST1.IMAGE_UPLOAD.CONTAINER.uuid}
        className="space-y-4 rounded-xl border border-outline-variant bg-surface-container p-4"
      >
        <button
          type="button"
          data-ui-uuid={TEST1.IMAGE_UPLOAD.UPLOAD_BUTTON.uuid}
          onClick={handleSelectImages}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary/90"
        >
          {t(TEST1.IMAGE_UPLOAD.UPLOAD_BUTTON)}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {previewImages.length > 0 && (
          <div
            data-ui-uuid={TEST1.IMAGE_UPLOAD.PREVIEW_CONTAINER.uuid}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {previewImages.map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt="Preview"
                className="col-span-1 h-32 w-full rounded-lg border border-outline-variant object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
