import apiRequest from "./apiservices";

export interface StudentProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  profile_photo_url?: string;
  bio?: string;
  updated_at?: string;
}

interface ProfileResponse {
  student: StudentProfile;
}

export async function getStudentProfile(token: string): Promise<StudentProfile> {
  const response = await apiRequest<ProfileResponse>("/students/profile", {
    method: "GET",
  }, token);
  return response.student;
}

export async function updateStudentProfile(
  token: string,
  formData: FormData
): Promise<{ message: string; student: StudentProfile }> {
  return apiRequest<{ message: string; student: StudentProfile }>(
    "/students/profile",
    {
      method: "PUT",
      body: formData,
    },
    token
  );
}
