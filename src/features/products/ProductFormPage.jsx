import { Box, Stethoscope } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '../../api';
import { Alert, Button, Card, CardBody, PageHeader, QueryState, SchemaForm, SegmentedControl } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useForm } from '../../hooks/useForm';
import { useMutation } from '../../hooks/useMutation';
import { emptyProduct, getProductFields, toProductPayload } from './productFields';

function ProductForm({ record, isEdit }) {
  const navigate = useNavigate();
  const toast = useToast();
  const form = useForm(record);
  const fields = useMemo(() => getProductFields(form.values.type), [form.values.type]);
  const save = useMutation((payload) => (isEdit ? productsApi.update(record.id, payload) : productsApi.create(payload)));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.validate(fields)) return;
    try {
      const saved = await save.mutate(toProductPayload(form.values));
      toast.success(isEdit ? 'Product updated' : 'Product created', form.values.name);
      navigate(isEdit ? `/products/${record.id}` : saved?.id ? `/products/${saved.id}` : '/products');
    } catch (err) {
      form.applyServerErrors(err);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="stack">
      <Card>
        <CardBody>
          <div className="stack">
            <div className="row-between">
              <div>
                <div className="form-section-title">Product type</div>
                <div className="form-section-desc" style={{ marginBottom: 0 }}>
                  {form.values.type === 'service'
                    ? 'Service products are time-based and do not hold physical stock. Company, brand and model are not required.'
                    : 'Standard products are physical items held in warehouse stock.'}
                </div>
              </div>
              <SegmentedControl
                ariaLabel="Product type"
                value={form.values.type}
                onChange={(type) => !isEdit && form.patch({ ...emptyProduct(type), ...pick(form.values, ['name', 'description', 'status', 'price']), type })}
                options={[
                  { value: 'standard', label: 'Standard product', icon: Box },
                  { value: 'service', label: 'Service product', icon: Stethoscope },
                ]}
              />
            </div>
            {isEdit && <div className="field-hint">The product type cannot be changed after creation.</div>}
            {save.error && (
              <Alert tone="danger" title="Could not save product">
                {save.error.message}
              </Alert>
            )}
            <SchemaForm fields={fields} form={form} />
          </div>
        </CardBody>
      </Card>
      <div className="form-actions">
        <Button onClick={() => navigate(-1)} disabled={save.loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={save.loading}>
          {isEdit ? 'Save changes' : 'Create product'}
        </Button>
      </div>
    </form>
  );
}

function pick(obj, keys) {
  return Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
}

export function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const query = useApiQuery(() => productsApi.get(id), [id], { enabled: isEdit });

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title={isEdit ? `Edit ${query.data?.name ?? 'product'}` : 'Add product'}
        description="Fields marked * are required."
      />
      {isEdit ? (
        <QueryState loading={query.loading} error={query.error} onRetry={query.refetch} resource="product">
          {query.data && <ProductForm key={query.data.id} record={query.data} isEdit />}
        </QueryState>
      ) : (
        <ProductForm record={emptyProduct()} />
      )}
    </>
  );
}
