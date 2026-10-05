import { downloadFile, http, openFile } from './client';
import { createResource, endpoint } from './resource';

export const patientsApi = createResource('/patients');

export const leadsApi = {
  ...createResource('/leads'),
  convertToPatient: endpoint((id) => http.post(`/leads/${id}/convert`)),
};

export const communicationsApi = createResource('/communications');
export const appointmentsApi = createResource('/appointments');
export const notesApi = createResource('/notes');
export const activitiesApi = createResource('/activities');

export const documentsApi = {
  ...createResource('/documents'),
  upload: endpoint((formData) => http.post('/documents/upload', formData)),
  open: (id) => openFile(`/documents/${id}/file`),
  download: (id, filename) => downloadFile(`/documents/${id}/file`, { filename }),
};
