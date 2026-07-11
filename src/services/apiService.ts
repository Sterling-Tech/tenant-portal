const REFUND_API_BASE_URL =
  process.env.REACT_APP_REFUND_API_URL ||
  "http://165.227.77.33:8001/api";
 //"http://159.89.28.140:8001/api";

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

export async function refundGetBlob(
  endpoint: string
): Promise<Blob> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${REFUND_API_BASE_URL}${endpoint}`,
    {
      method: "GET",
      headers: {
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

  return await response.blob();
}

export async function refundPost<T>(
  endpoint: string,
  body: unknown
): Promise<T> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${REFUND_API_BASE_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      body: JSON.stringify(body),
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

export async function refundPostFormData<T>(
  endpoint: string,
  body: FormData
): Promise<T> {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${REFUND_API_BASE_URL}${endpoint}`,
    {
      method: "POST",
      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      body,
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

export async function refundPostBasic<T>(
    endpoint: string,
    body: unknown,
    username: string,
    password: string
): Promise<T> {

    const credentials = btoa(
        `${username}:${password}`
    );

    const response = await fetch(
        `${REFUND_API_BASE_URL}${endpoint}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${credentials}`,
            },
            body: JSON.stringify(body),
        }
    );

    if (!response.ok) {
        throw await response.json();
    }

    return response.json();
}