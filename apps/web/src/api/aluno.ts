import { z } from "zod";
import { apiFetch } from "./client";

const getAlunoSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	nome: z.string(),
	email: z.email(),
	telefone: z.string().nullable(),
});

const createAlunoSchema = getAlunoSchema.omit({
	id: true,
	user_id: true,
});

export type CreateAlunoSchema = z.infer<typeof createAlunoSchema>;
export type GetAlunoSchema = z.infer<typeof getAlunoSchema>;

export async function getAlunos() {
	const data = await apiFetch("/api/alunos");

	return getAlunoSchema.array().parse(data);
}

export async function createAluno(aluno: CreateAlunoSchema) {
	const { data } = await apiFetch<{
		data: unknown;
	}>("/api/alunos/", {
		method: "POST",
		body: JSON.stringify(aluno),
	});

	return getAlunoSchema.parse(data);
}

export async function deleteAluno(id: number) {
	await apiFetch(`/api/alunos/${id}/`, {
		method: "DELETE",
	});
}

export async function updateAluno(
	id: number,
	aluno: Partial<CreateAlunoSchema>,
) {
	const data = await apiFetch(`/api/alunos/${id}/`, {
		method: "PATCH",
		body: JSON.stringify(aluno),
	});

	return getAlunoSchema.parse(data);
}
