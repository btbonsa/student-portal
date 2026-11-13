import apiRequest from "./apiservices";

export interface Branch {
  id: number;
  branch_name: string;
}

interface BranchesResponse {
  success: boolean;
  branches: Branch[];
}

export const getActiveBranches = async (): Promise<Branch[]> => {
  const response = await apiRequest<BranchesResponse>("/branches", {
    method: "GET",
  });
  return response.branches ?? [];
};
