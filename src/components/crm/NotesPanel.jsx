import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { notesApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatDateTime } from '../../utils/format';
import { EntityFormModal } from '../resource/EntityFormModal';
import { Avatar, Button, ConfirmDialog, FormField, QueryState, Textarea } from '../ui';

const NOTE_FIELDS = [{ name: 'body', label: 'Note', type: 'textarea', required: true, rows: 6, span: 12 }];

/** owner: { patientId } | { leadId } | { claimId } */
export function NotesPanel({ owner }) {
  const toast = useToast();
  const q = useApiQuery(() => notesApi.list({ ...owner, pageSize: 50, sortBy: 'createdAt', sortDir: 'desc' }), [JSON.stringify(owner)]);
  const [draft, setDraft] = useState('');
  const [draftError, setDraftError] = useState('');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!draft.trim()) {
      setDraftError('Write a note before saving.');
      return;
    }
    setAdding(true);
    try {
      await notesApi.create({ ...owner, body: draft.trim() });
      toast.success('Note added');
      setDraft('');
      q.refetch();
    } catch (err) {
      toast.error('Unable to add note', err.message);
    } finally {
      setAdding(false);
    }
  };

  const remove = async () => {
    setDeleteLoading(true);
    try {
      await notesApi.remove(deleting.id);
      toast.success('Note deleted');
      setDeleting(null);
      q.refetch();
    } catch (err) {
      toast.error('Unable to delete note', err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const notes = q.data?.items ?? [];

  return (
    <div className="stack">
      <form onSubmit={add} noValidate className="stack-sm">
        <FormField label="Add a note" error={draftError}>
          {({ id }) => (
            <Textarea
              id={id}
              rows={3}
              placeholder="Clinical or admin note…"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setDraftError('');
              }}
            />
          )}
        </FormField>
        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" size="sm" loading={adding}>
            Save note
          </Button>
        </div>
      </form>

      <QueryState loading={q.loading} error={q.error} onRetry={q.refetch} resource="notes" isEmpty={!notes.length} compact>
        <ol className="timeline">
          {notes.map((n) => (
            <li key={n.id} className="timeline-item">
              <Avatar name={n.authorName} size="sm" />
              <div className="timeline-content" style={{ paddingTop: 0 }}>
                <div className="row-between">
                  <div>
                    <span className="timeline-title">{n.authorName}</span>
                    <span className="timeline-meta" style={{ marginLeft: 8 }}>
                      {formatDateTime(n.createdAt)}
                      {n.updatedAt && ' · edited'}
                    </span>
                  </div>
                  <div className="timeline-actions">
                    <Button size="sm" variant="ghost" iconOnly icon={Pencil} aria-label="Edit note" onClick={() => setEditing(n)} />
                    <Button size="sm" variant="ghost" iconOnly icon={Trash2} aria-label="Delete note" onClick={() => setDeleting(n)} />
                  </div>
                </div>
                <p style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{n.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </QueryState>

      <EntityFormModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        size="md"
        title="Edit note"
        fields={NOTE_FIELDS}
        initialValues={{ body: editing?.body }}
        submitLabel="Save note"
        onSubmit={async (values) => {
          await notesApi.update(editing.id, values);
          toast.success('Note updated');
          setEditing(null);
          q.refetch();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
        loading={deleteLoading}
        title="Delete note?"
        message="This note will be permanently removed."
        confirmLabel="Delete note"
      />
    </div>
  );
}
