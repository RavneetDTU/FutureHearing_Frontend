import { Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui';
import { ResourceListPage } from '../../components/resource/ResourceListPage';
import { useSession } from '../../context/SessionContext';
import { CatalogImportModal } from './CatalogImportModal';
import { importIcdFile } from './importCatalog';
import { icdCodesConfig } from './resources';

export function IcdCodesPage() {
  const { can } = useSession();
  const [importing, setImporting] = useState(false);
  const [listKey, setListKey] = useState(0);
  return (
    <>
      <ResourceListPage
        key={listKey}
        config={{
          ...icdCodesConfig,
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
        title="Import ICD-10 codes"
        description="Accepts the Hearing Aid Labs ICD CSV (ICD10_Code, Diagnosis_Description, Category, 082/083 relevance) or columns code, description, category, status. Upserts by code on the server."
        hint="CSV or XLSX"
        accept=".csv,.xlsx"
        onImport={importIcdFile}
        onImported={() => setListKey((n) => n + 1)}
      />
    </>
  );
}
