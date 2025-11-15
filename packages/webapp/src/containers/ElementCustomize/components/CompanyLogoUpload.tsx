// @ts-nocheck
import { useRef, useState } from 'react';
import clsx from 'classnames';
import { Button, Intent } from '@blueprintjs/core';
import { Icon, Stack } from '@/components';
import { Dropzone, DropzoneProps } from '@/components/Dropzone';
import { MIME_TYPES } from '@/components/Dropzone/mine-types';
import { useUncontrolled } from '@/hooks/useUncontrolled';
import styles from './CompanyLogoUpload.module.scss';

export interface CompanyLogoUploadProps {
  /** Initial preview uri. */
  initialPreview?: string;

  /** The initial file object for uploading */
  initialValue?: File;

  /** The current file object for uploading */
  value?: File;

  /** Function called when the file is changed */
  onChange?: (file: File) => void;

  /** Function called when the URL is changed */
  onUrlChange?: (url: string) => void;

  /** Current logo URL */
  logoUrl?: string;

  /** Props for the Dropzone component */
  dropzoneProps?: DropzoneProps;

  /** Icon element for the upload button */
  uploadIcon?: JSX.Element;

  /** Title displayed in the component */
  title?: string;

  /** Custom CSS class names for styling */
  classNames?: Record<string, string>;
}

export function CompanyLogoUpload({
  initialPreview,
  initialValue,
  value,
  onChange,
  onUrlChange,
  logoUrl,
  dropzoneProps,
  uploadIcon = <Icon icon="download" iconSize={26} />,
  title = 'Drag images here or click to select files',
  classNames,
}: CompanyLogoUploadProps) {
  const [localValue, handleChange] = useUncontrolled<File | null>({
    value,
    initialValue,
    finalValue: null,
    onChange,
  });
  const [initialLocalPreview, setInitialLocalPreview] = useState<string | null>(
    initialPreview || null,
  );
  const [useUrlInput, setUseUrlInput] = useState<boolean>(!!logoUrl && !initialPreview);
  const [urlValue, setUrlValue] = useState<string>(logoUrl || '');

  const openRef = useRef<() => void>(null);

  const handleRemove = () => {
    handleChange(null);
    setInitialLocalPreview(null);
    setUrlValue('');
    if (onUrlChange) {
      onUrlChange('');
    }
  };
  const imagePreviewUrl = localValue
    ? URL.createObjectURL(localValue)
    : urlValue || initialLocalPreview || '';

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrlValue(newUrl);
    if (onUrlChange) {
      onUrlChange(newUrl);
    }
    // Clear file if URL is provided
    if (newUrl) {
      handleChange(null);
      setInitialLocalPreview(null);
    }
  };

  const handleToggleMode = () => {
    setUseUrlInput(!useUrlInput);
    // Clear both when switching modes
    handleRemove();
  };

  return (
    <div>
      <Dropzone
        onDrop={(files) => {
          handleChange(files[0]);
          setUrlValue('');
          if (onUrlChange) {
            onUrlChange('');
          }
        }}
        onReject={(files) => console.log('rejected files', files)}
        maxSize={5 * 1024 ** 2}
        accept={[MIME_TYPES.png, MIME_TYPES.jpeg]}
        classNames={{ root: clsx(styles?.root, classNames?.root), content: styles.dropzoneContent }}
        activateOnClick={false}
        openRef={openRef}
        {...dropzoneProps}
      >
        {imagePreviewUrl ? (
          <span>
            <img src={imagePreviewUrl} alt="" className={styles.previewImage} />
            <Button
              minimal
              intent={Intent.DANGER}
              onClick={handleRemove}
              icon={<Icon icon={'smallCross'} iconSize={16} />}
              className={styles?.removeButton}
            />
          </span>
        ) : (
          <Stack spacing={10} align="center" className={styles.contentPrePreview}>
            {!useUrlInput ? (
              <>
                {title && <span className={styles.title}>{title}</span>}
                <Button
                  intent="none"
                  onClick={() => openRef.current?.()}
                  style={{ pointerEvents: 'all' }}
                  minimal
                  outlined
                  small
                >
                  {'Upload File'}
                </Button>
                <Button
                  intent="none"
                  onClick={handleToggleMode}
                  style={{ pointerEvents: 'all' }}
                  minimal
                  small
                >
                  {'Or enter URL'}
                </Button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Enter logo URL"
                  value={urlValue}
                  onChange={handleUrlInputChange}
                  className="bp4-input"
                  style={{ width: '100%', pointerEvents: 'all' }}
                />
                <Button
                  intent="none"
                  onClick={handleToggleMode}
                  style={{ pointerEvents: 'all' }}
                  minimal
                  small
                >
                  {'Or upload file'}
                </Button>
              </>
            )}
          </Stack>
        )}
      </Dropzone>
    </div>
  );
}
