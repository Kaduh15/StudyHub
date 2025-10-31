import { redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { apiFetch } from "../client";

export async function getIsAdmin() {
	try {
		const res = await apiFetch<{ is_admin: boolean }>("/api/auth/is-admin", {
			method: "GET",
		});

		return res;
	} catch {
		toast.error("Erro ao verificar permissões de administrador.");
		toast.info("Por favor, faça login novamente.");
		throw redirect({ to: "/auth/login" });
	}
}
