import { PackageCheck, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { purchasesApi } from '../../api';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  DetailList,
  PageHeader,
  QueryState,
  StatusBadge,
} from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatCurrency, formatDate } from '../../utils/format';

export function PurchaseDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const { data: p, loading, error, refetch } = useApiQuery(() => purchasesApi.get(id), [id]);
  const [confirming, setConfirming] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState(null);

  const complete = async () => {
    setCompleting(true);
    setCompleteError(null);
    try {
      await purchasesApi.complete(id);
      toast.success('Purchase received', 'Stock will be booked into the selected warehouse.');
      setConfirming(false);
      refetch();
    } catch (err) {
      setConfirming(false);
      setCompleteError(err);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <QueryState loading={loading} error={error} onRetry={refetch} resource="purchase">
      {p && (
        <div className="stack" style={{ gap: 24 }}>
          <PageHeader
            eyebrow="Purchase"
            title={p.number}
            description={`From ${p.supplierName}`}
            actions={
              p.status !== 'completed' && (
                <>
                  <Button icon={Pencil} to={`/purchases/${p.id}/edit`}>
                    Edit
                  </Button>
                  <Button variant="primary" icon={PackageCheck} onClick={() => setConfirming(true)}>
                    Mark as received
                  </Button>
                </>
              )
            }
          >
            <div style={{ marginTop: 10 }}>
              <StatusBadge domain="purchase" value={p.status} />
            </div>
          </PageHeader>

          {completeError && (
            <Alert tone="danger" title="Unable to complete purchase">
              {completeError.message}
            </Alert>
          )}

          <Card>
            <CardBody>
              <DetailList
                columns={3}
                items={[
                  { label: 'Supplier', value: p.supplierName },
                  { label: 'Supplier reference', value: p.supplierReference },
                  { label: 'Date received', value: formatDate(p.date) },
                  { label: 'Branch', value: p.branchName },
                  { label: 'Warehouse', value: p.warehouseName },
                  { label: 'Allocated to patient', value: p.patientId && <Link to={`/patients/${p.patientId}`}>{p.patientName}</Link> },
                  { label: 'Total', value: formatCurrency(p.total) },
                  { label: 'Units', value: p.itemCount },
                  { label: 'Notes', value: p.notes },
                ]}
              />
            </CardBody>
          </Card>

          <Card flush>
            <CardHeader title="Products" />
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Unit cost</th>
                    <th>Serial numbers</th>
                  </tr>
                </thead>
                <tbody>
                  {p.lines?.map((l) => (
                    <tr key={l.id}>
                      <td className="strong">{l.productName}</td>
                      <td className="text-right">{l.quantity}</td>
                      <td className="text-right">{formatCurrency(l.unitCost)}</td>
                      <td>
                        {l.trackSerials ? (
                          <div className="row">
                            {Array.from({ length: l.quantity }, (_, i) =>
                              l.serialNumbers?.[i] ? (
                                <Badge key={i} className="mono">
                                  {l.serialNumbers[i]}
                                </Badge>
                              ) : (
                                <Badge key={i} tone="warning">
                                  Unit {i + 1}: missing
                                </Badge>
                              ),
                            )}
                          </div>
                        ) : (
                          <span className="subtle">Not tracked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <ConfirmDialog
            open={confirming}
            onClose={() => setConfirming(false)}
            onConfirm={complete}
            loading={completing}
            tone="primary"
            title="Mark purchase as received?"
            message={`The backend will add these units to ${p.branchName} · ${p.warehouseName}. This cannot be undone.`}
            confirmLabel="Mark as received"
          />
        </div>
      )}
    </QueryState>
  );
}
