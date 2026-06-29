import { confirmDelete as alertConfirmDelete } from '@/utils/alertHelper';

export function useConfirmDelete() {
  const confirmDelete = async (label) => {
    return await alertConfirmDelete(label);
  };

  return { confirmDelete };
}
