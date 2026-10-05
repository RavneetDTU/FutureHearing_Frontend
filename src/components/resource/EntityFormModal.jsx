import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';
import { Alert, Button, LoadingState, Modal } from '../ui';
import { SchemaForm } from '../forms/SchemaForm';

function FormBody({ title, description, fields, initialValues, onSubmit, onClose, submitLabel, size }) {
  const form = useForm(initialValues, fields);
  const { mutate, loading, error } = useMutation(onSubmit);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.validate()) return;
    try {
      await mutate(form.values);
    } catch (err) {
      form.applyServerErrors(err);
    }
  };

  return (
    <Modal
      open
      as="form"
      onSubmit={handleSubmit}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="stack">
        {error && (
          <Alert tone="danger" title="Could not save">
            {error.message}
          </Alert>
        )}
        <SchemaForm fields={fields} form={form} />
      </div>
    </Modal>
  );
}

/**
 * Add/Edit modal driven by field definitions. Mounts fresh each time it opens.
 * `onSubmit(values)` should call the API and resolve/throw; server field errors are mapped onto inputs.
 */
export function EntityFormModal({ open, loading, size = 'lg', submitLabel = 'Save', ...props }) {
  if (!open) return null;
  if (loading) {
    return (
      <Modal open onClose={props.onClose} title={props.title} size={size}>
        <LoadingState message="Loading record…" />
      </Modal>
    );
  }
  return <FormBody size={size} submitLabel={submitLabel} {...props} />;
}
