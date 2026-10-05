import clsx from 'clsx';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { fullTestsApi } from '../../api';
import { Alert, Button, Card, FormField, Modal, MultiSelect, QueryState } from '../../components/ui';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useOptions } from '../../hooks/useOptions';
import { formatCurrency } from '../../utils/format';

/**
 * Full Test = backend-defined template of service products. Steps: choose template -> ICD code -> review -> add.
 * onAdd(template, icdCodeIds)
 */
export function FullTestModal({ open, onClose, onAdd }) {
  const [step, setStep] = useState('choose');
  const [template, setTemplate] = useState(null);
  const [icdCodeIds, setIcdCodeIds] = useState([]);
  const [error, setError] = useState('');
  const templates = useApiQuery(() => fullTestsApi.list({ status: 'active', pageSize: 50 }), [], { enabled: open });
  const icd = useOptions('icdCodes', { status: 'active' }, { enabled: open });

  const reset = () => {
    setStep('choose');
    setTemplate(null);
    setIcdCodeIds([]);
    setError('');
  };
  const close = () => {
    reset();
    onClose();
  };

  const choose = (t) => {
    setTemplate(t);
    setIcdCodeIds(t.defaultIcdCodeIds ?? []);
    setStep('review');
  };

  const confirm = () => {
    if (!icdCodeIds.length) {
      setError('Select at least one ICD-10 code for this Full Test.');
      return;
    }
    onAdd(template, icdCodeIds);
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title={step === 'choose' ? 'Add Full Test' : template?.name}
      description={step === 'choose' ? 'A Full Test adds a predefined group of services to the invoice.' : template?.description}
      footer={
        step === 'review' && (
          <>
            <Button icon={ArrowLeft} onClick={reset}>
              Back
            </Button>
            <Button variant="primary" onClick={confirm}>
              Continue to invoice
            </Button>
          </>
        )
      }
    >
      {step === 'choose' ? (
        <QueryState
          loading={templates.loading}
          error={templates.error}
          onRetry={templates.refetch}
          resource="Full Test templates"
          isEmpty={!templates.data?.items?.length}
          compact
        >
          <div className="stack-sm">
            {templates.data?.items?.map((t) => (
              <button key={t.id} type="button" className={clsx('card list-row')} style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }} onClick={() => choose(t)}>
                <div className="entity">
                  <span className="icon-tile">
                    <ClipboardList size={18} />
                  </span>
                  <div>
                    <div className="entity-title">{t.name}</div>
                    <div className="entity-sub">
                      {t.services.length} services · {t.services.map((s) => s.productName).join(', ')}
                    </div>
                  </div>
                </div>
                <span className="strong nowrap">{formatCurrency(t.price)}</span>
              </button>
            ))}
          </div>
        </QueryState>
      ) : (
        <div className="stack">
          <Card flush>
            <table className="table table-compact">
              <thead>
                <tr>
                  <th>Included service</th>
                  <th>Procedure code</th>
                  <th className="text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {template.services.map((s) => (
                  <tr key={s.productId}>
                    <td className="strong">{s.productName}</td>
                    <td className="mono">{s.procedureCode}</td>
                    <td className="text-right">{formatCurrency(s.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <FormField label="ICD-10 code(s)" required error={error} hint="Applied to every service in this Full Test.">
            {({ id }) => (
              <MultiSelect
                id={id}
                options={icd.options}
                loading={icd.loading}
                value={icdCodeIds}
                onChange={(v) => {
                  setIcdCodeIds(v);
                  setError('');
                }}
                placeholder="Search ICD-10 codes…"
              />
            )}
          </FormField>
          <Alert tone="info">Prices shown come from the template. Final totals are calculated by the backend on the invoice.</Alert>
        </div>
      )}
    </Modal>
  );
}
