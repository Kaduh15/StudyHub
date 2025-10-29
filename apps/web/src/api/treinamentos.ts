import { z } from "zod";
import { apiFetch } from "./client";

// {
//  id: number
//  nome: string
//  descricao: any
//  total_treinamentos: number
//}

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

export type createTreinamentoSchema = z.infer<typeof createTreinamentoSchema>;
export type getTreinamentoSchema = z.infer<typeof getTreinamentoSchema>;

export async function getTreinamentos() {
	const data = await apiFetch("/api/treinamentos");

	return getTreinamentoSchema.array().parse(data);
}

export async function createTreinamento(treinamento: createTreinamentoSchema) {
	const data = await apiFetch("/api/treinamentos", {
		method: "POST",
		body: JSON.stringify(treinamento),
	});

	return getTreinamentoSchema.parse(data);
}
