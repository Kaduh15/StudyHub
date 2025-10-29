import { z } from "zod";
import { formatDate } from "@/utils/format-date";
import { apiFetch } from "./client";

const getTurmaSchema = z.object({
	id: z.number(),
	treinamento: z.number(),
	treinamento_nome: z.string(),
	nome: z.string(),
	data_inicio: z.string().transform((str) => formatDate(str)),
	data_conclusao: z
		.string()
		.transform((str) => formatDate(str))
		.nullable(),
	link_acesso: z.url().nullable().optional(),
	total_alunos: z.number(),
});

const createTurmaSchema = getTurmaSchema.omit({
	id: true,
	total_alunos: true,
	treinamento_nome: true,
});

export type CreateTurmaSchema = z.infer<typeof createTurmaSchema>;
export type GetTurmaSchema = z.infer<typeof getTurmaSchema>;

export async function getTurmas() {
	const data = await apiFetch("/api/turmas/");

	return getTurmaSchema.array().parse(data);
}

export async function createTurma(turma: CreateTurmaSchema) {
	const data = await apiFetch("/api/turmas/", {
		method: "POST",
		body: JSON.stringify(turma),
	});

	return getTurmaSchema.parse(data);
}

export async function deleteTurma(id: number) {
	await apiFetch(`/api/turmas/${id}/`, {
		method: "DELETE",
	});
}

export async function updateTurma(
	id: number,
	turma: Partial<CreateTurmaSchema>,
) {
	if (turma.data_inicio) {
		turma.data_inicio = new Date(turma.data_inicio).toISOString().split("T")[0];
	}
	if (turma.data_conclusao) {
		turma.data_conclusao = new Date(turma.data_conclusao).toISOString().split("T")[0];
	}

	const data = await apiFetch(`/api/turmas/${id}/`, {
		method: "PATCH",
		body: JSON.stringify(turma),
	});

	return getTurmaSchema.parse(data);
}
