import { z } from "zod";
import { apiFetch } from "./client";

const getRecursoSchema = z.object({
	id: z.number(),
	turma: z.number(),
	turma_nome: z.string(),
	tipo: z.enum(["PDF", "VIDEO", "ZIP"]),
	tipo_display: z.enum(["PDF", "Vídeo", "Arquivo ZIP"]),
	nome: z.string(),
	descricao: z.string().nullable(),
	acesso_previo: z.boolean(),
	draft: z.boolean(),
	criado_em: z.coerce.date(),
	atualizado_em: z.coerce.date(),
});

const createRecursoSchema = getRecursoSchema.omit({
	id: true,
	turma_nome: true,
	tipo_display: true,
	criado_em: true,
	atualizado_em: true,
});

export type CreateRecursoSchema = z.infer<typeof createRecursoSchema>;
export type GetRecursoSchema = z.infer<typeof getRecursoSchema>;

export async function getRecursos() {
	const data = await apiFetch("/api/recursos");

	return getRecursoSchema.array().parse(data);
}

export async function createRecurso(recurso: CreateRecursoSchema) {
	const data = await apiFetch("/api/recursos/", {
		method: "POST",
		body: JSON.stringify(recurso),
	});

	return getRecursoSchema.parse(data);
}

export async function deleteRecurso(id: number) {
	await apiFetch(`/api/recursos/${id}/`, {
		method: "DELETE",
	});
}

export async function updateRecurso(
	id: number,
	recurso: Partial<CreateRecursoSchema>,
) {
	const data = await apiFetch(`/api/recursos/${id}/`, {
		method: "PATCH",
		body: JSON.stringify(recurso),
	});

	return getRecursoSchema.parse(data);
}
