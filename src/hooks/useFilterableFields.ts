import { useDirectoryStore } from '../store/directoryStore';
import { useMemo } from 'react';
import { ProfileField } from '../types';

export const useFilterableFields = (): ProfileField[] => {
  const getFilterableFields = useDirectoryStore((state) => state.getFilterableFields);

  const fields = useMemo(() => getFilterableFields(), [getFilterableFields]);

  return fields;
};
