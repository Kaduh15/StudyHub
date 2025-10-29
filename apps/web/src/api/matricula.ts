import { z } from "zod";
import { apiFetch } from "./client";

// {
//  id: number
//  nome: string
//  descricao: any
//  total_matriculas: number
//}

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

export type createMatriculaSchema = z.infer<typeof createMatriculaSchema>;
export type getMatriculaSchema = z.infer<typeof getMatriculaSchema>;

export async function getMatriculas() {
	const data = await apiFetch("/api/matriculas");

	return getMatriculaSchema.array().parse(data);
}

export async function createMatricula(matricula: createMatriculaSchema) {
	const data = await apiFetch("/api/matriculas", {
		method: "POST",
		body: JSON.stringify(matricula),
	});

	return getMatriculaSchema.parse(data);
}
