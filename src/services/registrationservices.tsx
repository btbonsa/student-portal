import  apiRequest  from "./apiservices";

export interface Registration {
  id: number;
  registration_number: string;
  status: string;
  registration_date: string;
  student: { first_name: string; last_name: string };

  program: {
    id: number;
    name: string;
    description: string | null;
    duration: string | null;
    fee: number;
  };

  payment: {
    id: number;
    amount: number;
    payment_method: string;
    transaction_reference: string | null;
    screenshot_url: string;
    status: string;
    rejection_reason: string | null;
    payment_date: string;
    reviewed_at: string | null;
  } | null;
}

interface RegistrationResponse {
  success: boolean;
  registration: Registration;
}

export const getMyRegistration = async (
  token: string
): Promise<Registration> => {
  const response =
    await apiRequest<RegistrationResponse>(
      "/registration/my",
      {},
      token
    );

  return response.registration;
};

export const createRegistration = async (
  program_id: number,
  token: string
) => {
  return apiRequest(
    "/registration/enroll",
    {
      method: "POST",
      body: JSON.stringify({
        program_id,
      }),
    },
    token
  );
};