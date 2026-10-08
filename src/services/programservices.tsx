import apiRequest  from "./apiservices";

export interface Program {
  id: number;
  name: string;
  description: string | null;
  duration: string | null;
  fee: number;
}

interface ProgramsResponse {
  success: boolean;
  programs: Program[];
}

export const getPrograms = async (): Promise<Program[]> => {
  const response = await apiRequest<ProgramsResponse>(
    "/programs"
  );

  return response.programs;
};