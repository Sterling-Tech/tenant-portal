const REFUND_API_BASE_URL =
  process.env.REACT_APP_REFUND_API_URL ||
  "http://165.227.77.33:8001/api";
//   "http://159.89.28.140:8001/api";

export async function refundGet<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${REFUND_API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Something went wrong",
    }));

    throw error;
  }

  return response.json();
}