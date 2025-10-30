import { z } from "zod";
import { apiFetch } from "./client";

const getMatriculaSchema = z.object({
	id: z.number(),
	aluno: z.number(),
	aluno_nome: z.string(),
	turma: z.number(),
	turma_nome: z.string(),
	data_matricula: z.coerce.date(),
});

const createMatriculaSchema = getMatriculaSchema.omit({
	id: true,
	aluno_nome: true,
	turma_nome: true,
	data_matricula: true,
});

export type CreateMatriculaSchema = z.infer<typeof createMatriculaSchema>;
export type GetMatriculaSchema = z.infer<typeof getMatriculaSchema>;

export async function getMatriculas() {
	const data = await apiFetch("/api/matriculas/");

	return getMatriculaSchema.array().parse(data);
}

export async function createMatricula(matricula: CreateMatriculaSchema) {
	const data = await apiFetch("/api/matriculas/", {
		method: "POST",
		body: JSON.stringify(matricula),
	});

	return getMatriculaSchema.parse(data);
}

export async function deleteMatricula(id: number) {
	await apiFetch(`/api/matriculas/${id}/`, {
		method: "DELETE",
	});
}

export async function updateMatricula(
	id: number,
	matricula: Partial<CreateMatriculaSchema>,
) {
	const data = await apiFetch(`/api/matriculas/${id}/`, {
		method: "PATCH",
		body: JSON.stringify(matricula),
	});

	return getMatriculaSchema.parse(data);
}
