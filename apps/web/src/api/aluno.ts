import { z } from "zod";
import { apiFetch } from "./client";

const getAlunoSchema = z.object({
	id: z.number(),
	user_id: z.number(),
	nome: z.string(),
	email: z.email(),
	telefone: z.string().nullable(),
});

export async function getAlunos() {
	const data = await apiFetch("/api/alunos");

	return getAlunoSchema.array().parse(data);
}

export async function createAluno(aluno: z.infer<typeof getAlunoSchema>) {
	const data = await apiFetch("/api/alunos", {
		method: "POST",
		body: JSON.stringify(aluno),
	});

	return getAlunoSchema.parse(data);
}
