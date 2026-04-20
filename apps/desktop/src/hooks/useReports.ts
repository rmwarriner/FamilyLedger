import { useMutation } from '@tanstack/react-query';
import { runReport } from '../ipc/reports';

export const useReports = () =>
  useMutation({ mutationFn: async (id: string) => runReport(id) });
