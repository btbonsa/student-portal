import apiRequest from "./apiservices";


export interface Program {
  id: number;
  name: string;
  description: string | null;
  duration: string | null;
  fee: string;
  monthly_fee: string;
  image_url: string | null;
  is_public?: number | boolean;
}

interface ProgramsResponse {
  success: boolean;
  programs: Program[];
}

interface ProgramResponse {
  success: boolean;
  program: Program;
}

export const getPrograms = async (token?: string): Promise<Program[]> => {
  const response = await apiRequest<ProgramsResponse>("/programs", {}, token);
  return response.programs;
};

export const getProgram = async (
  id: number,
  token?: string
): Promise<Program | null> => {
  try {
    const response = await apiRequest<ProgramResponse>(
      `/programs/${id}`,
      {},
      token
    );
    return response.program;
  } catch (err) {
    // Adjust this depending on how apiRequest reports a 404
    if (err instanceof Error && /not found/i.test(err.message)) return null;
    throw err;
  }
};