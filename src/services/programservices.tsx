import apiRequest from "./apiservices";


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

interface ProgramResponse {
  success: boolean;
  program: Program;
}

export const getPrograms = async (): Promise<Program[]> => {
  const response = await apiRequest<ProgramsResponse>("/programs");
  return response.programs;
};

export const getProgram = async (id: number): Promise<Program | null> => {
  try {
    const response = await apiRequest<ProgramResponse>(`/programs/${id}`);
    return response.program;
  } catch (err) {
    // Adjust this depending on how apiRequest reports a 404
    if (err instanceof Error && /not found/i.test(err.message)) return null;
    throw err;
  }
};