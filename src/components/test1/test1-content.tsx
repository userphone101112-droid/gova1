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
    console.log("files received:", files);
    if (!files?.length) return;

    const nextImages: PreviewImage[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      url: URL.createObjectURL(file),
    }));
    console.log("nextImages", nextImages);

    setPreviewImages((current) => {
      const newState = [...current, ...nextImages];
      console.log("new state", newState);
      return newState;
    });
    event.target.value = '';
  }, []);

  return (
    <div
      className="mx-auto min-h-48 max-w-5xl space-y-6 bg-background px-4 py-8"
    >
      <h1
        data-ui-uuid={TEST1.PAGE.TITLE.uuid}
        data-ui-lang-uuid={`lang-${TEST1.PAGE.TITLE.uuid}`}
        className="text-2xl font-bold text-on-surface"
      >
        {t('test1.page.title')}
      </h1>

      <div
        className="space-y-4"
      >
        <input
          id="test1-input1"
          data-ui-uuid={TEST1.FORM.INPUT_1.uuid}
          data-ui-lang-uuid={`lang-${TEST1.FORM.INPUT_1.uuid}`}
          type="text"
          value={input1}
          onChange={(event) => setInput1(event.target.value)}
          placeholder={t('test1.form.input1')}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface placeholder:text-on-surface-variant"
        />

        <input
          id="test1-input2"
          data-ui-uuid={TEST1.FORM.INPUT_2.uuid}
          data-ui-lang-uuid={`lang-${TEST1.FORM.INPUT_2.uuid}`}
          type="text"
          value={input2}
          onChange={(event) => setInput2(event.target.value)}
          placeholder={t('test1.form.input2')}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface placeholder:text-on-surface-variant"
        />

        <input
          id="test1-input3"
          data-ui-uuid={TEST1.FORM.INPUT_3.uuid}
          data-ui-lang-uuid={`lang-${TEST1.FORM.INPUT_3.uuid}`}
          type="text"
          value={input3}
          onChange={(event) => setInput3(event.target.value)}
          placeholder={t('test1.form.input3')}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-on-surface placeholder:text-on-surface-variant"
        />

        <button
          type="button"
          data-ui-uuid={TEST1.FORM.SAVE_BUTTON.uuid}
          data-ui-lang-uuid={`lang-${TEST1.FORM.SAVE_BUTTON.uuid}`}
          onClick={() => alert('Saved!')}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary/90"
        >
          {t('test1.form.saveButton')}
        </button>
      </div>

      <div
        className="grid grid-cols-2 gap-3 space-y-4 rounded-xl border border-outline-variant bg-surface-container p-4 sm:grid-cols-3"
      >
        <button
          type="button"
          data-ui-uuid={TEST1.IMAGE_UPLOAD.UPLOAD_BUTTON.uuid}
          data-ui-lang-uuid={`lang-${TEST1.IMAGE_UPLOAD.UPLOAD_BUTTON.uuid}`}
          onClick={handleSelectImages}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary/90"
        >
          {t('test1.image-upload.uploadButton')}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {previewImages.map((image) => (
          <img
            key={image.id}
            data-ui-uuid={TEST1.IMAGE_UPLOAD.PREVIEW_IMAGE.uuid}
            data-ui-lang-uuid={`lang-${TEST1.IMAGE_UPLOAD.PREVIEW_IMAGE.uuid}`}
            data-ui-instance-id={image.id}
            src={image.url}
            alt={t('test1.image-upload.previewImage')}
            className="col-span-1 h-32 w-full rounded-lg border border-outline-variant object-cover"
          />
        ))}
      </div>
    </div>
  );
}
