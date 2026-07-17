import { useMutation } from "@tanstack/react-query";
import { commonServices } from "@/services";

export const useUpdateGSheet = () => {
  return useMutation({
    mutationFn: () => commonServices.updateSheet(),
  });
};

export const useBackupDB = () => {
  return useMutation({
    mutationFn: () => commonServices.backupDB(),
  });
};
