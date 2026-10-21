import apiRequest  from "./apiservices";

export interface Program {
  id: number;
  name: string;
  description: string | null;
  duration: string | null;
  fee: string; // This is actually the image URL from the API
  monthly_fee: string; // This is the actual price from the API
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