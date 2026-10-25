import { Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui';
import { ResourceListPage } from '../../components/resource/ResourceListPage';
import { useSession } from '../../context/SessionContext';
import { CatalogImportModal } from './CatalogImportModal';
import { importMedicalAidCsv } from './importCatalog';
import { medicalAidsConfig } from './resources';

export function MedicalAidsListPage() {
  const { can } = useSession();
  const [importing, setImporting] = useState(false);
  const [listKey, setListKey] = useState(0);
  return (
    <>
      <ResourceListPage
        key={listKey}
        config={{
          ...medicalAidsConfig,
          headerActions: can('medicalAids.create') ? (
            <Button icon={Upload} onClick={() => setImporting(true)}>
              Import schemes
            </Button>
          ) : null,
        }}
      />
      <CatalogImportModal
        open={importing}
        onClose={() => setImporting(false)}
        title="Import medical aids"
        description="Accepts the Hearing Aid Labs 2026 medical-aid CSV. Each Medical Aid Name becomes a scheme; each Plan becomes a plan. Cycle, ZAR limits, coverage and scheme type are stored as plan/scheme fields. Claims stay manual."
        hint="Hearing_Aid_Labs_Medical_Aids_2026_Provisional_Expanded_Import.csv"
        onImport={importMedicalAidCsv}
        onImported={() => setListKey((n) => n + 1)}
      />
    </>
  );
}
