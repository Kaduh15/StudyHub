import { z } from "zod";
import { formatDate } from "@/utils/format-date";
import { apiFetch } from "./client";

// {id: number;
// treinamento: number;
// treinamento_nome: string;
// nome: string;
// data_inicio: string;
// data_conclusao: any;
// link_acesso: any;
// total_alunos: number;}

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
	link_acesso: z.url().nullable(),
	total_alunos: z.number(),
});

const createTurmaSchema = getTurmaSchema.omit({
	id: true,
	total_alunos: true,
	treinamento_nome: true,
});

export type createTurmaSchema = z.infer<typeof createTurmaSchema>;
export type getTurmaSchema = z.infer<typeof getTurmaSchema>;

export async function getTurmas() {
	const data = await apiFetch("/api/turmas");

	return getTurmaSchema.array().parse(data);
}

export async function createTurma(turma: createTurmaSchema) {
	const data = await apiFetch("/api/turmas", {
		method: "POST",
		body: JSON.stringify(turma),
	});

	return getTurmaSchema.parse(data);
}
