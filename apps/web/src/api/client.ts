import { ENV } from "@/env";

export async function apiFetch<T>(
	path: string,
	options?: RequestInit,
): Promise<T> {
	const token = localStorage.getItem("access_token");
	if (!options) {
		options = {};
	}
	if (!options.headers) {
		options.headers = {};
	}

	if (token) {
		(options.headers as Record<string, string>)["Authorization"] =
			`Bearer ${token}`;
	}

	const res = await fetch(`${ENV.VITE_APP_URL_API}${path}`, {
		headers: {
			"Content-Type": "application/json",
			...(options?.headers || {}),
		},
		credentials: "include", // se tiver autenticação via cookie
		...options,
	});

	if (!res.ok) {
		const errorBody = await res.text();
		throw new Error(`Erro ${res.status}: ${errorBody}`);
	}

	return res.json() as Promise<T>;
}
