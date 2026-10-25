import { Upload } from 'lucide-react';
import { useState } from 'react';
import { Alert, Button, FileUpload, Modal } from '../../components/ui';
import { useToast } from '../../context/ToastContext';

export function CatalogImportModal({ open, onClose, title, description, hint, accept = '.csv', onImport, onImported }) {
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const close = () => {
    setFiles([]);
    setResult(null);
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (!files.length) {
      setError({ message: 'Choose a CSV file to import.' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await onImport(files[0]);
      setResult(res);
      toast.success('Import complete', `${res.imported ?? 0} saved`);
      onImported?.();
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={title}
      description={description}
      footer={
        <>
          <Button onClick={close}>{result ? 'Close' : 'Cancel'}</Button>
          {!result && (
            <Button variant="primary" icon={Upload} loading={loading} onClick={submit}>
              Import
            </Button>
          )}
        </>
      }
    >
      <div className="stack">
        {error && <Alert tone="danger">{error.message}</Alert>}
        {result ? (
          <Alert tone={result.errors?.length ? 'warning' : 'success'} title="Import complete">
            {result.imported ?? 0} saved · {result.skipped ?? 0} skipped
            {result.errors?.length > 0 && (
              <div className="text-sm" style={{ marginTop: 8 }}>
                {result.errors.slice(0, 8).map((line) => (
                  <div key={line}>{line}</div>
                ))}
                {result.errors.length > 8 && <div>…and {result.errors.length - 8} more</div>}
              </div>
            )}
          </Alert>
        ) : (
          <FileUpload files={files} onChange={setFiles} multiple={false} accept={accept} hint={hint} />
        )}
      </div>
    </Modal>
  );
}
