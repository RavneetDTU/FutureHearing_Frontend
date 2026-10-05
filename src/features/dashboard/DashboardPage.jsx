import {
  AlertTriangle,
  Building2,
  FileClock,
  HeartPulse,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api';
import {
  ActivityFeed,
  Button,
  Card,
  CardHeader,
  DataTable,
  EntityCell,
  ErrorState,
  PageHeader,
  QueryState,
  StatCard,
  StatusBadge,
} from '../../components/ui';
import { useSession } from '../../context/SessionContext';
import { useApiQuery } from '../../hooks/useApiQuery';
import { formatCurrency, formatDate, formatNumber } from '../../utils/format';

function RevenueChart({ series = [] }) {
  const max = Math.max(1, ...series.map((s) => s.value));
  return (
    <div className="bar-chart" role="img" aria-label="Revenue by month">
      {series.map((s) => (
        <div key={s.label} className="bar-col" title={`${s.label}: ${formatCurrency(s.value)}`}>
          <div className="bar" style={{ height: `${(s.value / max) * 100}%` }} />
          <span className="bar-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const { branchId, user } = useSession();
  const { data, loading, error, refetch } = useApiQuery(() => dashboardApi.summary({ branchId }), [branchId]);
  const stats = data?.stats ?? {};

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Workspace" title="Operations overview" />
        <Card>
          <ErrorState title="Unable to load dashboard" message="Unable to load dashboard. Please try again." onRetry={refetch} />
        </Card>
      </>
    );
  }

  const cards = [
    { label: 'Total branches', value: formatNumber(stats.totalBranches), icon: Building2, to: '/branches', hint: 'Active and inactive' },
    { label: 'Total patients', value: formatNumber(stats.totalPatients), icon: Users, to: '/patients', tone: 'info', hint: 'Across selected branches' },
    { label: 'Total products', value: formatNumber(stats.totalProducts), icon: Package, to: '/products', tone: 'purple', hint: 'Standard and service' },
    { label: 'Low stock', value: formatNumber(stats.lowStock), icon: AlertTriangle, to: '/stock', tone: 'warning', hint: `${formatNumber(stats.outOfStock)} out of stock` },
    { label: 'Pending invoices', value: formatNumber(stats.pendingInvoices), icon: FileClock, to: '/invoices', tone: 'warning', hint: 'Unpaid or partially paid' },
    { label: 'Pending purchases', value: formatNumber(stats.pendingPurchases), icon: ShoppingCart, to: '/purchases', tone: 'neutral', hint: 'Not yet received' },
    { label: 'Open medical claims', value: formatNumber(stats.openClaims), icon: HeartPulse, to: '/claims', tone: 'brand', hint: 'Requiring completion' },
    { label: 'New leads', value: formatNumber(stats.newLeads), icon: Target, to: '/leads', tone: 'success', hint: 'Not yet contacted' },
  ];

  return (
    <div className="stack" style={{ gap: 24 }}>
      <PageHeader
        eyebrow="Workspace"
        title="Operations overview"
        description={`Welcome back${user?.fullName ? `, ${user.fullName}` : ''}. Totals are provided by the backend for the selected branch.`}
        actions={
          <>
            <Button icon={RefreshCw} onClick={refetch} loading={loading}>
              Refresh data
            </Button>
            <Button variant="primary" icon={Plus} to="/invoices/new">
              New invoice
            </Button>
          </>
        }
      />

      <div className="grid grid-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} loading={loading} />
        ))}
      </div>

      <div className="grid grid-main-aside">
        <Card>
          <CardHeader
            title="Revenue / sales overview"
            subtitle="VAT-inclusive invoice totals by month"
            actions={
              !loading && (
                <span className="badge tone-success">
                  <TrendingUp size={13} /> {stats.revenueChange ?? 0}% vs last month
                </span>
              )
            }
          />
          <div className="card-body">
            <QueryState loading={loading} resource="revenue" isEmpty={!data?.revenueSeries?.length} compact>
              <div className="stack-sm">
                <div className="stat-value">{formatCurrency(stats.revenueMonth)}</div>
                <div className="muted text-sm">This month</div>
                <RevenueChart series={data?.revenueSeries} />
              </div>
            </QueryState>
          </div>
        </Card>
        <Card flush>
          <CardHeader title="Recent activity" actions={<Link to="/patients" className="text-sm">View patients</Link>} />
          <QueryState loading={loading} resource="activity" isEmpty={!data?.recentActivity?.length} compact>
            <ActivityFeed items={data?.recentActivity} />
          </QueryState>
        </Card>
      </div>

      <div className="grid grid-main-aside">
        <Card flush>
          <CardHeader title="Branch overview" actions={<Link to="/branches" className="text-sm">All branches</Link>} />
          <DataTable
            compact
            loading={loading}
            resource="branches"
            rows={data?.branches ?? []}
            columns={[
              { key: 'name', header: 'Branch', render: (b) => <Link to={`/branches/${b.id}`} className="strong">{b.name}</Link> },
              { key: 'patients', header: 'Patients', align: 'right' },
              { key: 'openInvoices', header: 'Open invoices', align: 'right' },
              { key: 'lowStock', header: 'Stock alerts', align: 'right', render: (b) => (b.lowStock ? <span className="badge tone-warning">{b.lowStock}</span> : '0') },
              { key: 'status', header: 'Status', render: (b) => <StatusBadge value={b.status} /> },
            ]}
          />
        </Card>
        <Card flush>
          <CardHeader title="Stock summary" subtitle="Items needing attention" actions={<Link to="/stock" className="text-sm">Stock</Link>} />
          <QueryState loading={loading} resource="stock" isEmpty={!data?.stock?.length} compact>
            <ul className="list-plain">
              {data?.stock?.map((s) => (
                <li key={s.id} className="list-row">
                  <div style={{ minWidth: 0 }}>
                    <div className="entity-title">{s.productName}</div>
                    <div className="entity-sub">
                      {s.branchName} · {s.warehouseName}
                    </div>
                  </div>
                  <div className="row" style={{ flexWrap: 'nowrap' }}>
                    <span className="strong">{s.available}</span>
                    <StatusBadge domain="stock" value={s.status} />
                  </div>
                </li>
              ))}
            </ul>
          </QueryState>
        </Card>
      </div>

      <div className="grid grid-3">
        <Card flush>
          <CardHeader title="Recent invoices" actions={<Link to="/invoices" className="text-sm">View all</Link>} />
          <QueryState loading={loading} resource="invoices" isEmpty={!data?.recentInvoices?.length} compact>
            <ul className="list-plain">
              {data?.recentInvoices?.map((inv) => (
                <li key={inv.id}>
                  <Link to={`/invoices/${inv.id}`} className="list-row">
                    <div>
                      <div className="entity-title">{inv.number}</div>
                      <div className="entity-sub">
                        {inv.patientName} · {formatDate(inv.date)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="strong">{formatCurrency(inv.total)}</div>
                      <StatusBadge domain="invoice" value={inv.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </QueryState>
        </Card>
        <Card flush>
          <CardHeader title="Recent patients" actions={<Link to="/patients" className="text-sm">View all</Link>} />
          <QueryState loading={loading} resource="patients" isEmpty={!data?.recentPatients?.length} compact>
            <ul className="list-plain">
              {data?.recentPatients?.map((p) => (
                <li key={p.id}>
                  <Link to={`/patients/${p.id}`} className="list-row">
                    <EntityCell name={p.fullName} subtitle={p.patientNumber} size="sm" />
                    <span className="text-sm muted">{p.branchNames}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </QueryState>
        </Card>
        <Card flush>
          <CardHeader title="Recent claims" actions={<Link to="/claims" className="text-sm">View all</Link>} />
          <QueryState loading={loading} resource="claims" isEmpty={!data?.recentClaims?.length} compact>
            <ul className="list-plain">
              {data?.recentClaims?.map((c) => (
                <li key={c.id}>
                  <Link to={`/claims/${c.id}`} className="list-row">
                    <div>
                      <div className="entity-title">{c.number}</div>
                      <div className="entity-sub">
                        {c.patientName} · {c.medicalAidName}
                      </div>
                    </div>
                    <StatusBadge domain="claim" value={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </QueryState>
        </Card>
      </div>
    </div>
  );
}
