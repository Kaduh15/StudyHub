export const mockTrainings = [
	{
		id: 1,
		name: "Python Básico",
		description: "Introdução à linguagem Python",
	},
	{
		id: 2,
		name: "Django Avançado",
		description: "Desenvolvimento web com Django",
	},
	{
		id: 3,
		name: "JavaScript Avançado",
		description: "Conceitos avançados de JS",
	},
];

export const mockClasses = [
	{
		id: 1,
		name: "Turma 2024-01",
		trainingId: 1,
		startDate: "2024-01-10",
		endDate: "2024-03-10",
		accessLink: "https://meet.google.com/python",
	},
	{
		id: 2,
		name: "Turma 2024-02",
		trainingId: 2,
		startDate: "2024-02-01",
		endDate: "2024-04-01",
		accessLink: "https://meet.google.com/django",
	},
	{
		id: 3,
		name: "Turma 2024-03",
		trainingId: 3,
		startDate: "2025-11-01",
		endDate: "2025-12-31",
		accessLink: "https://meet.google.com/js",
	},
];

export const mockResources = [
	{
		id: 1,
		classId: 1,
		type: "PDF",
		name: "Apostila Python - Módulo 1",
		url: "#",
		acessoPrevio: false,
		draft: false,
	},
	{
		id: 2,
		classId: 1,
		type: "VIDEO",
		name: "Aula 1 - Instalação",
		url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		acessoPrevio: true,
		draft: false,
	},
	{
		id: 3,
		classId: 1,
		type: "ZIP",
		name: "Exercícios Práticos",
		url: "#",
		acessoPrevio: false,
		draft: false,
	},
	{
		id: 4,
		classId: 2,
		type: "VIDEO",
		name: "Django - Primeiros Passos",
		url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
		acessoPrevio: false,
		draft: false,
	},
	{
		id: 5,
		classId: 2,
		type: "PDF",
		name: "Material Complementar Django",
		url: "#",
		acessoPrevio: true,
		draft: false,
	},
	{
		id: 6,
		classId: 3,
		type: "PDF",
		name: "Preparação para o curso",
		url: "#",
		acessoPrevio: true,
		draft: false,
	},
	{
		id: 7,
		classId: 1,
		type: "VIDEO",
		name: "Aula 2 - Variáveis (Rascunho)",
		url: "#",
		acessoPrevio: false,
		draft: true,
	},
];

export const mockStudents = [
	{
		id: 1,
		name: "João Silva",
		email: "joao@email.com",
		phone: "(11) 98765-4321",
	},
	{
		id: 2,
		name: "Maria Santos",
		email: "maria@email.com",
		phone: "(11) 91234-5678",
	},
	{
		id: 3,
		name: "Pedro Oliveira",
		email: "pedro@email.com",
		phone: "(11) 99999-8888",
	},
];

export const mockEnrollments = [
	{ id: 1, studentId: 1, classId: 1 },
	{ id: 2, studentId: 1, classId: 2 },
	{ id: 3, studentId: 2, classId: 1 },
	{ id: 4, studentId: 2, classId: 3 },
	{ id: 5, studentId: 3, classId: 2 },
];

export const mockUsers = {
	admin: { username: "admin", password: "admin", isStaff: true },
	aluno1: {
		username: "aluno1",
		password: "aluno1",
		isStaff: false,
		studentId: 1,
	},
	aluno2: {
		username: "aluno2",
		password: "aluno2",
		isStaff: false,
		studentId: 2,
	},
};
