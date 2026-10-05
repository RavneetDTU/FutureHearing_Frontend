import clsx from 'clsx';
import { FileText, UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { formatFileSize } from '../../utils/format';

/** Selects files only — the caller decides what to do with them (e.g. send as FormData to the API). */
export function FileUpload({ files = [], onChange, multiple = true, accept, hint = 'PDF, JPG or PNG up to 10 MB' }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const add = (list) => {
    const incoming = Array.from(list || []);
    onChange(multiple ? [...files, ...incoming] : incoming.slice(0, 1));
  };

  return (
    <div>
      <div
        className={clsx('dropzone', dragging && 'is-dragging')}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
      >
        <UploadCloud size={28} color="var(--color-primary)" />
        <div>
          <strong style={{ color: 'var(--gray-800)' }}>Click to upload</strong> or drag and drop
        </div>
        <div className="text-sm">{hint}</div>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={multiple}
          accept={accept}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="file-item">
              <FileText size={16} color="var(--color-primary)" />
              <span style={{ flex: 1 }}>{file.name}</span>
              <span className="subtle">{formatFileSize(file.size)}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                aria-label={`Remove ${file.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
