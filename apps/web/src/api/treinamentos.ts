import { z } from "zod";
import { apiFetch } from "./client";

const getTreinamentoSchema = z.object({
	id: z.number(),
	nome: z.string(),
	descricao: z.string().nullable(),
	total_turmas: z.coerce.number(),
});

const createTreinamentoSchema = getTreinamentoSchema.omit({
	id: true,
	total_turmas: true,
});

export type CreateTreinamentoSchema = z.infer<typeof createTreinamentoSchema>;
export type GetTreinamentoSchema = z.infer<typeof getTreinamentoSchema>;

export async function getTreinamentos() {
	const data = await apiFetch("/api/treinamentos/");

	return getTreinamentoSchema.array().parse(data);
}

export async function createTreinamento(treinamento: CreateTreinamentoSchema) {
	const data = await apiFetch("/api/treinamentos/", {
		method: "POST",
		body: JSON.stringify(treinamento),
	});

	return getTreinamentoSchema.parse(data);
}

export async function deleteTreinamento(id: number) {
	await apiFetch(`/api/treinamentos/${id}/`, {
		method: "DELETE",
	});
}

export async function updateTreinamento(
	id: number,
	treinamento: Partial<CreateTreinamentoSchema>,
) {
	const data = await apiFetch(`/api/treinamentos/${id}/`, {
		method: "PATCH",
		body: JSON.stringify(treinamento),
	});

	return getTreinamentoSchema.parse(data);
}
