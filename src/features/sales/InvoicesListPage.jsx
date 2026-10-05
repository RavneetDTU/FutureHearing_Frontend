import { ClipboardList, Eye, FileCheck2, Pencil, Printer } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoicesApi } from '../../api';
import { col } from '../../components/resource/columns';
import { Button, Card, DataTable, PageHeader, Pagination, SearchBar, Select, StatusBadge, Tabs } from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useToast } from '../../context/ToastContext';
import { useListQuery } from '../../hooks/useListQuery';
import { formatCurrency, formatDate, invoicePaidAmount, invoicePaymentStatus } from '../../utils/format';

const STAGE_TABS = [
  { key: '', label: 'All' },
  { key: 'quote', label: 'Quote' },
  { key: 'proforma', label: 'Pro forma' },
  { key: 'invoice', label: 'Invoice' },
];

const CREATE_TYPES = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'quote', label: 'Quote' },
  { value: 'proforma', label: 'Pro forma' },
];

export const invoicesConfig = {
  resource: 'invoices',
  title: 'Invoices',
  singular: 'Invoice',
  columns: [
    { key: 'date', header: 'Date', sortable: true, render: (r) => formatDate(r.date) },
    col.strong('number', 'Reference'),
    { key: 'branchName', header: 'Branch', sortable: true, render: (r) => <div>{r.branchName}<div className="entity-sub">{r.warehouseName}</div></div> },
    col.link('patientName', 'Patient', (r) => `/patients/${r.patientId}`),
    { key: 'type', header: 'Status', sortable: true, render: (r) => <StatusBadge domain="invoiceType" value={r.type} dot={false} /> },
    col.currency('total', 'Total'),
    { key: 'paid', header: 'Paid', align: 'right', render: (r) => formatCurrency(invoicePaidAmount(r)) },
    col.currency('balance', 'Balance'),
    { key: 'payment', header: 'Payment', render: (r) => <StatusBadge domain="invoicePayment" value={invoicePaymentStatus(r)} /> },
  ],
};

export function InvoicesListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { can, branchId } = useSession();
  const [createType, setCreateType] = useState('invoice');
  const list = useListQuery(invoicesApi.list, {
    filters: { type: '' },
    sortBy: 'date',
    sortDir: 'desc',
    baseParams: branchId ? { branchId } : {},
  });

  const rowActions = (row) =>
    [
      { label: 'View', icon: Eye, to: `/invoices/${row.id}` },
      row.type !== 'invoice' && can('invoices.edit') && { label: 'Edit', icon: Pencil, to: `/invoices/${row.id}/edit` },
      row.type !== 'invoice' &&
        can('invoices.create') && {
          label: 'Convert to invoice',
          icon: FileCheck2,
          onClick: async () => {
            try {
              await invoicesApi.convertToInvoice(row.id);
              toast.success('Converted to invoice', row.number);
              list.refetch();
            } catch (err) {
              toast.error('Unable to convert', err.message);
            }
          },
        },
      { label: 'Print', icon: Printer, to: `/invoices/${row.id}?print=1` },
    ].filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="Invoice"
        title="Invoices"
        description="Quotes, pro formas, final invoices and payments."
        actions={
          <>
            <Button icon={ClipboardList} to="/invoices/new?fullTest=1">
              Full Test
            </Button>
            {can('invoices.create') && (
              <div className="create-document-control">
                <Select
                  aria-label="Document type to create"
                  options={CREATE_TYPES}
                  value={createType}
                  allowEmpty={false}
                  onChange={(e) => setCreateType(e.target.value)}
                />
                <Button variant="primary" to={`/invoices/new?type=${createType}`}>
                  Add
                </Button>
              </div>
            )}
          </>
        }
      />

      <Card flush>
        <div className="toolbar">
          <SearchBar value={list.search} onChange={list.setSearch} placeholder="Search number or patient…" />
          <Tabs variant="pills" tabs={STAGE_TABS} value={list.filters.type} onChange={(v) => list.setFilter('type', v)} />
          <span className="result-count">
            <b>{list.total}</b>
            <span>records shown</span>
          </span>
        </div>
        <DataTable
          resource="invoices"
          columns={invoicesConfig.columns}
          rows={list.items}
          loading={list.loading}
          error={list.error}
          onRetry={list.refetch}
          sort={list.sort}
          onSort={list.toggleSort}
          rowActions={rowActions}
          onRowClick={(row) => navigate(`/invoices/${row.id}`)}
          emptyTitle="No invoices match this view."
          emptyMessage="Create a quote, pro forma or invoice from the Add button."
        />
        {!list.error && (
          <Pagination page={list.page} pageSize={list.pageSize} total={list.total} onPageChange={list.setPage} onPageSizeChange={list.setPageSize} />
        )}
      </Card>
    </>
  );
}
