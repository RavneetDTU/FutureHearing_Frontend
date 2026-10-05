import { downloadFile, http, openFile } from './client';
import { createResource, endpoint } from './resource';

export const patientsApi = createResource('/patients', 'patients');

export const leadsApi = {
  ...createResource('/leads', 'leads'),
  convertToPatient: endpoint('leads.convert', (id) => http.post(`/leads/${id}/convert`)),
};

export const communicationsApi = createResource('/communications', 'communications');
export const appointmentsApi = createResource('/appointments', 'appointments');
export const notesApi = createResource('/notes', 'notes');
export const activitiesApi = createResource('/activities', 'activities');

export const documentsApi = {
  ...createResource('/documents', 'documents'),
  upload: endpoint('documents.upload', (formData) => http.post('/documents/upload', formData)),
  open: (id) => openFile(`/documents/${id}/file`),
  download: (id, filename) => downloadFile(`/documents/${id}/file`, { filename }),
};
