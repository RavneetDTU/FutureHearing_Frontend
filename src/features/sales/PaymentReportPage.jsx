import { useMemo, useState } from 'react';
import { reportsApi } from '../../api';
import { Alert, Button, Card, CardBody, DatePicker, FormField, PageHeader, QueryState, ResourceSelect, Select, StatCard } from '../../components/ui';
import { optionLabel } from '../../config/statuses';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatCurrency, formatNumber } from '../../utils/format';

const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'eft', label: 'EFT' },
  { value: 'medical_aid', label: 'Medical aid' },
];

export function PaymentReportPage() {
  const [branchId, setBranchId] = useState('');
  const [method, setMethod] = useState('cash');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [applied, setApplied] = useState({ method: 'cash' });

  const params = useMemo(
    () => ({
      method: applied.method || undefined,
      branchId: applied.branchId || undefined,
      from: applied.from || undefined,
      to: applied.to && applied.to.length === 10 ? `${applied.to}T23:59:59` : applied.to || undefined,
    }),
    [applied],
  );
  const report = useApiQuery(() => reportsApi.payments(params), [params]);

  return (
    <div className="stack" style={{ gap: 16 }}>
      <PageHeader
        eyebrow="Sales"
        title="Payment totals"
        description="Server totals for payments. From is exclusive and to is inclusive. This page does not add up payment list pages."
      />
      <Card>
        <CardBody>
          <form
            className="form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setApplied({ branchId, method, from, to });
            }}
          >
            <FormField label="Branch">
              {({ id }) => (
                <ResourceSelect id={id} resource="branches" params={{ status: 'active' }} value={branchId} onChange={setBranchId} placeholder="All branches" />
              )}
            </FormField>
            <FormField label="Method">
              {({ id }) => (
                <Select id={id} options={METHODS} value={method} allowEmpty={false} onChange={(e) => setMethod(e.target.value)} />
              )}
            </FormField>
            <FormField label="From (exclusive)" hint="Leave empty for the first payment">
              {({ id }) => <DatePicker id={id} value={from} onChange={(e) => setFrom(e.target.value)} />}
            </FormField>
            <FormField label="To (inclusive)">
              {({ id }) => <DatePicker id={id} value={to} onChange={(e) => setTo(e.target.value)} />}
            </FormField>
            <div className="form-actions span-12">
              <Button type="submit" variant="primary">
                Load totals
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
      <QueryState loading={report.loading} error={report.error} onRetry={report.refetch} resource="payment totals">
        {report.data && (
          <div className="grid grid-2">
            <StatCard
              label={`${optionLabel('paymentMethod', report.data.method)} payments`}
              value={formatNumber(report.data.count)}
              hint="Count returned by the server"
            />
            <StatCard label="Total" value={formatCurrency(report.data.total)} hint="Do not compare this with a browser sum of payment pages" />
          </div>
        )}
      </QueryState>
      {report.data && report.data.count === 0 && (
        <Alert tone="info">No payments match this branch, method and time range.</Alert>
      )}
    </div>
  );
}
