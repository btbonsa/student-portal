import  apiRequest  from "./apiservices";

export interface ClassSchedule {
  id: number;
  registration_id: number;
  registration_number: string;

  class_start_date: string;
  class_start_time: string | null;

  location: string | null;
  message: string | null;
}

interface ClassScheduleResponse {
  success: boolean;
  schedule: ClassSchedule;
}

export const getMyClassSchedule = async (
  token: string
): Promise<ClassSchedule> => {
  const response =
    await apiRequest<ClassScheduleResponse>(
      "/classes/",
      {},
      token
    );

  return response.schedule;
};