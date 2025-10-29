import { useMutation } from "@tanstack/react-query";
import { ENV } from "@/env";
import type { LoginSchema } from "./-schema";

async function loginUser(data: LoginSchema) {
	const res = await fetch(`${ENV.VITE_APP_URL_API}/api/auth/token`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			username: data.email,
			password: data.password,
		}),
	});
	if (!res.ok) throw new Error("Credenciais inválidas");
	return res.json() as Promise<{ access: string; is_staff: boolean }>;
}

export function useLogin() {
	return useMutation({ mutationFn: loginUser });
}
