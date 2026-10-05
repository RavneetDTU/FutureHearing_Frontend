import { Upload } from 'lucide-react';
import { useState } from 'react';
import { icdCodesApi } from '../../api';
import { ResourceListPage } from '../../components/resource/ResourceListPage';
import { Alert, Button, FileUpload, Modal } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { icdCodesConfig } from './resources';

function ImportModal({ open, onClose, onImported }) {
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
      setError({ message: 'Choose a CSV or XLSX file to import.' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', files[0]);
      const res = await icdCodesApi.import(form);
      setResult(res);
      toast.success('Import complete', `${res.imported ?? 0} upserted by code`);
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
      title="Import ICD-10 codes"
      description="Upload a CSV / XLSX with columns: code, description, category, status. Import is synchronous and upserts by code."
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
          <Alert tone="success" title="Import complete">
            {result.imported ?? 0} imported · {result.skipped ?? 0} skipped
            {result.errors?.length > 0 && ` · ${result.errors.length} errors`}
          </Alert>
        ) : (
          <FileUpload files={files} onChange={setFiles} multiple={false} accept=".csv,.xlsx" hint="CSV or XLSX" />
        )}
      </div>
    </Modal>
  );
}

export function IcdCodesPage() {
  const [importing, setImporting] = useState(false);
  const [listKey, setListKey] = useState(0);
  return (
    <>
      <ResourceListPage
        key={listKey}
        config={{
          ...icdCodesConfig,
          headerActions: (
            <Button icon={Upload} onClick={() => setImporting(true)}>
              Import codes
            </Button>
          ),
        }}
      />
      <ImportModal open={importing} onClose={() => setImporting(false)} onImported={() => setListKey((n) => n + 1)} />
    </>
  );
}
