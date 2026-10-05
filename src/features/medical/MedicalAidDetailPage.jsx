import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { medicalAidsApi } from '../../api';
import { EntityFormModal } from '../../components/resource/EntityFormModal';
import { ResourceListPage } from '../../components/resource/ResourceListPage';
import { Button, Card, CardBody, DetailList, PageHeader, QueryState, StatusBadge } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { medicalAidPlansConfig, medicalAidsConfig } from './resources';

export function MedicalAidDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const { data: aid, loading, error, refetch } = useApiQuery(() => medicalAidsApi.get(id), [id]);
  const [editing, setEditing] = useState(false);

  const planConfig = {
    ...medicalAidPlansConfig,
    title: 'Plans',
    columns: medicalAidPlansConfig.columns.filter((c) => c.key !== 'medicalAidName'),
    filters: medicalAidPlansConfig.filters.filter((f) => f.key !== 'medicalAidId'),
  };

  return (
    <QueryState loading={loading} error={error} onRetry={refetch} resource="medical aid">
      {aid && (
        <div className="stack" style={{ gap: 24 }}>
          <PageHeader
            eyebrow={`Medical aid · ${aid.code}`}
            title={aid.name}
            actions={
              <Button variant="primary" icon={Pencil} onClick={() => setEditing(true)}>
                Edit medical aid
              </Button>
            }
          >
            <div style={{ marginTop: 10 }}>
              <StatusBadge value={aid.status} />
            </div>
          </PageHeader>
          <Card>
            <CardBody>
              <DetailList
                columns={3}
                items={[
                  { label: 'Administrator', value: aid.administrator },
                  { label: 'Telephone', value: aid.phone },
                  { label: 'General email', value: aid.email },
                  { label: 'Claims email', value: aid.claimsEmail },
                  { label: 'Website', value: aid.website && <a href={aid.website} target="_blank" rel="noreferrer">{aid.website}</a> },
                ]}
              />
            </CardBody>
          </Card>
          <div className="stack-sm">
            <div>
              <h2 className="card-title">Plans</h2>
              <p className="card-subtitle">Plans offered by {aid.name}</p>
            </div>
            <ResourceListPage embedded config={planConfig} baseParams={{ medicalAidId: id }} initialValues={{ medicalAidId: id }} />
          </div>
          <EntityFormModal
            open={editing}
            onClose={() => setEditing(false)}
            title="Edit medical aid"
            fields={medicalAidsConfig.fields}
            initialValues={aid}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await medicalAidsApi.update(id, values);
              toast.success('Medical aid updated');
              setEditing(false);
              refetch();
            }}
          />
        </div>
      )}
    </QueryState>
  );
}
