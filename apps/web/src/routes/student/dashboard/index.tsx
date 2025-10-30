import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { addDays, isAfter, isWithinInterval, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ExternalLink, GraduationCap, LogOut } from "lucide-react";
import { getTurmas } from "@/api/turmas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface StudentClass {
	id: number;
	name: string;
	status: string;
	trainingName: string;
	startDate: string;
	endDate: string | null;
}

const turmaQueryOptions = queryOptions({
	queryKey: ["studentClasses"],
	queryFn: getTurmas,
});

export const Route = createFileRoute("/student/dashboard/")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { queryClient } = context;

		await queryClient.ensureQueryData(turmaQueryOptions);
	},
});

function RouteComponent() {
	const { data } = useSuspenseQuery(turmaQueryOptions);

	const navigate = useNavigate();

	const studentClasses: StudentClass[] = data.map((turma) => {
		const initialDate = parse(turma.data_inicio, "dd/MM/yyyy", new Date(), {
			locale: ptBR,
		});
		const completedDate = turma.data_conclusao
			? parse(turma.data_conclusao, "dd/MM/yyyy", new Date(), {
					locale: ptBR,
				})
			: addDays(new Date(), 1);

		const inProgress = isWithinInterval(new Date(), {
			start: initialDate,
			end: completedDate,
		});

		const completed = isAfter(new Date(), completedDate);

		return {
			id: turma.id,
			name: turma.nome,
			status: inProgress
				? "Em andamento"
				: completed
					? "Concluída"
					: "Não iniciada",
			trainingName: turma.treinamento_nome,
			startDate: initialDate.toLocaleDateString("pt-BR"),
			endDate:
				turma.data_conclusao &&
				new Date(turma.data_conclusao).toLocaleDateString("pt-BR"),
		};
	});

	function handleLogout(): void {
		localStorage.removeItem("access_token");
		localStorage.removeItem("role");
		navigate({ to: "/auth/login" });
	}

	function openResources(id: number): void {
		navigate({ to: `/student/turma/${id}` });
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="bg-card border-b border-border sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
							<GraduationCap className="w-6 h-6 text-primary-foreground" />
						</div>
						<div>
							<h1 className="text-lg font-bold text-foreground">StudyHub</h1>
							<p className="text-xs text-muted-foreground">Meu Painel</p>
						</div>
					</div>
					<Button variant="outline" onClick={handleLogout}>
						<LogOut className="w-4 h-4 mr-2" />
						Sair
					</Button>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-6 py-8">
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-foreground mb-2">
						Minhas Turmas
					</h2>
					<p className="text-muted-foreground">
						Acesse seus treinamentos e recursos
					</p>
				</div>

				{studentClasses.length === 0 ? (
					<Card>
						<CardContent className="py-12 text-center">
							<p className="text-muted-foreground">
								Você não está matriculado em nenhuma turma
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{studentClasses.map((classItem) => (
							<Card
								key={classItem.id}
								className="hover:shadow-lg transition-shadow"
							>
								<CardHeader>
									<div className="flex items-start justify-between mb-2">
										<CardTitle className="text-lg">{classItem.name}</CardTitle>
										<Badge
											variant={
												classItem.status === "Em andamento"
													? "default"
													: "secondary"
											}
										>
											{classItem.status}
										</Badge>
									</div>
									<CardDescription>{classItem.trainingName}</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Calendar className="w-4 h-4" />
										<span>
											{classItem.startDate}{" "}
											{classItem.endDate && `- ${classItem.endDate}`}
										</span>
									</div>
									<Button
										className="w-full"
										onClick={() => openResources(classItem.id)}
									>
										<ExternalLink className="w-4 h-4 mr-2" />
										Ver Recursos
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
