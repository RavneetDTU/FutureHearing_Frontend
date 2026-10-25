import { Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui';
import { ResourceListPage } from '../../components/resource/ResourceListPage';
import { useSession } from '../../context/SessionContext';
import { CatalogImportModal } from './CatalogImportModal';
import { importProcedureCsv } from './importCatalog';
import { procedureCodesConfig } from './resources';

export function ProcedureCodesPage() {
  const { can } = useSession();
  const [importing, setImporting] = useState(false);
  const [listKey, setListKey] = useState(0);
  return (
    <>
      <ResourceListPage
        key={listKey}
        config={{
          ...procedureCodesConfig,
          headerActions: can('medicalAids.create') ? (
            <Button icon={Upload} onClick={() => setImporting(true)}>
              Import codes
            </Button>
          ) : null,
        }}
      />
      <CatalogImportModal
        open={importing}
        onClose={() => setImporting(false)}
        title="Import procedure codes"
        description="Accepts the Hearing Aid Labs claim-code CSV (Procedure_Code, Practice_Type, 2026_COIDA_Tariff_ZAR_Excl_VAT). Tariff is a COIDA guideline, not a guaranteed scheme payment."
        hint="Hearing_Aid_Labs_Audiology_Acoustician_Claim_Codes_2026.csv"
        onImport={importProcedureCsv}
        onImported={() => setListKey((n) => n + 1)}
      />
    </>
  );
}
