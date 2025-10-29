import { ENV } from "@/env";

export async function apiFetch<T>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const token = localStorage.getItem("access_token");

	const response = await fetch(`${ENV.VITE_APP_URL_API}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			Authorization: token ? `Bearer ${token}` : "",
			...(options.headers || {}),
		},
	});

	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}

	if (response.status === 204) {
		return {} as T;
	}

	return response.json();
}
