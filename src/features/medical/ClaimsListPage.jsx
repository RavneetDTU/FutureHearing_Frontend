import { useSearchParams } from 'react-router-dom';
import { invoicesApi, patientsApi } from '../../api';
import { ResourceListPage } from '../../components/resource/ResourceListPage';
import { QueryState } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { claimsConfig } from './resources';

/** Supports `?invoiceId=` / `?patientId=` to open a pre-filled "Add claim" form (from invoice / patient pages). */
export function ClaimsListPage() {
  const [params] = useSearchParams();
  const invoiceId = params.get('invoiceId');
  const patientId = params.get('patientId');

  const prefill = useApiQuery(
    async () => {
      const invoice = invoiceId ? await invoicesApi.get(invoiceId) : null;
      const pid = invoice?.patientId ?? patientId;
      const patient = pid ? await patientsApi.get(pid) : null;
      return {
        patientId: patient?.id ?? '',
        patientName: patient?.fullName ?? '',
        medicalAidId: patient?.medicalAidId ?? '',
        medicalAidPlanId: patient?.medicalAidPlanId ?? '',
        membershipNumber: patient?.membershipNumber ?? '',
        invoiceId: invoice?.id ?? '',
        invoiceNumber: invoice?.number ?? '',
        amount: invoice?.balance ?? '',
        icdCodeIds: invoice?.icdCodeIds ?? [],
      };
    },
    [invoiceId, patientId],
    { enabled: Boolean(invoiceId || patientId) },
  );

  if (invoiceId || patientId) {
    return (
      <QueryState loading={prefill.loading} error={prefill.error} onRetry={prefill.refetch} resource="claim details">
        {prefill.data && <ResourceListPage key={`${invoiceId}-${patientId}`} config={claimsConfig} openCreateWith={prefill.data} />}
      </QueryState>
    );
  }
  return <ResourceListPage config={claimsConfig} />;
}
