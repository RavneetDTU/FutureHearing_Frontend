import { Download, Eye, FileText, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { documentsApi } from '../../api';
import { OPTION_SETS, optionLabel } from '../../config/statuses';
import { useToast } from '../../context/ToastContext';
import { useListQuery } from '../../hooks/useListQuery';
import { formatDateTime, formatFileSize } from '../../utils/format';
import { Alert, Button, Card, ConfirmDialog, DataTable, FileUpload, FormField, Modal, Pagination, Select } from '../ui';

function UploadModal({ open, onClose, owner, onDone }) {
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [type, setType] = useState('other');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const close = () => {
    setFiles([]);
    setError('');
    onClose();
  };

  const upload = async () => {
    if (!files.length) {
      setError('Choose at least one file to upload.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      for (const file of files) {
        const form = new FormData();
        form.append('file', file);
        form.append('name', file.name);
        form.append('type', type);
        Object.entries(owner).forEach(([k, v]) => form.append(k, v));
        await documentsApi.upload(form);
      }
      toast.success(`${files.length} document${files.length > 1 ? 's' : ''} uploaded`);
      onDone();
      close();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Upload documents"
      description="Files are sent to the backend document service."
      footer={
        <>
          <Button onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" icon={Upload} loading={loading} onClick={upload}>
            Upload
          </Button>
        </>
      }
    >
      <div className="stack">
        {error && <Alert tone="danger">{error}</Alert>}
        <FormField label="Document type" required>
          {({ id }) => <Select id={id} options={OPTION_SETS.documentType} value={type} allowEmpty={false} onChange={(e) => setType(e.target.value)} />}
        </FormField>
        <FileUpload files={files} onChange={setFiles} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
      </div>
    </Modal>
  );
}

/** owner: { patientId } | { claimId } */
export function DocumentsPanel({ owner }) {
  const toast = useToast();
  const list = useListQuery(documentsApi.list, { baseParams: owner, filters: { type: '' }, sortBy: 'uploadedAt', sortDir: 'desc' });
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const remove = async () => {
    setDeleteLoading(true);
    try {
      await documentsApi.remove(deleting.id);
      toast.success('Document deleted');
      setDeleting(null);
      list.refetch();
    } catch (err) {
      toast.error('Unable to delete document', err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="stack">
      <div className="row-between">
        <div style={{ width: 220 }}>
          <Select
            aria-label="Filter by document type"
            options={OPTION_SETS.documentType}
            value={list.filters.type}
            placeholder="All document types"
            onChange={(e) => list.setFilter('type', e.target.value)}
          />
        </div>
        <Button variant="primary" size="sm" icon={Upload} onClick={() => setUploading(true)}>
          Upload document
        </Button>
      </div>
      <Card flush>
        <DataTable
          resource="documents"
          rows={list.items}
          loading={list.loading}
          error={list.error}
          onRetry={list.refetch}
          columns={[
            {
              key: 'name',
              header: 'Document',
              render: (d) => (
                <div className="entity">
                  <span className="icon-tile" style={{ width: 34, height: 34 }}>
                    <FileText size={16} />
                  </span>
                  <div>
                    <div className="entity-title">{d.name}</div>
                    <div className="entity-sub">{formatFileSize(d.size)}</div>
                  </div>
                </div>
              ),
            },
            { key: 'type', header: 'Type', render: (d) => optionLabel('documentType', d.type) },
            { key: 'uploadedAt', header: 'Date', render: (d) => <span className="nowrap">{formatDateTime(d.uploadedAt)}</span> },
            { key: 'uploadedBy', header: 'Uploaded by' },
            {
              key: 'actions',
              header: '',
              align: 'right',
              render: (d) => (
                <div className="row" style={{ justifyContent: 'flex-end', flexWrap: 'nowrap' }}>
                  <Button size="sm" variant="ghost" icon={Eye} title="Preview" onClick={() => documentsApi.open(d.id).catch((err) => toast.error('Unable to open document', err.message))}>
                    Preview
                  </Button>
                  <Button size="sm" variant="ghost" icon={Download} title="Download" onClick={() => documentsApi.download(d.id, d.name).catch((err) => toast.error('Unable to download document', err.message))}>
                    Download
                  </Button>
                  <Button size="sm" variant="ghost" iconOnly icon={Trash2} aria-label={`Delete ${d.name}`} onClick={() => setDeleting(d)} />
                </div>
              ),
            },
          ]}
        />
        {list.total > list.pageSize && <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onPageChange={list.setPage} />}
      </Card>
      <UploadModal open={uploading} onClose={() => setUploading(false)} owner={owner} onDone={list.refetch} />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={deleteLoading}
        title="Delete document?"
        message={`"${deleting?.name}" will be permanently deleted.`}
        confirmLabel="Delete document"
      />
    </div>
  );
}
