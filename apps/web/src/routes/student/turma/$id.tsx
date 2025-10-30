import {
	queryOptions,
	useSuspenseQueries,
} from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import {
	ArrowLeft,
	Download,
	File,
	FileText,
	GraduationCap,
	LogOut,
	Play,
	Video,
} from "lucide-react";
import { useState } from "react";
import { getRecursoTurma, getTurmaById } from "@/api/turmas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface VideoRecurso {
	tipo: string;
	url: string;
	nome?: string;
}

interface turmaItem {
	nome: string;
	data_inicial: string;
	data_conclusao: string | null;
}

interface Treinamento {
	nome: string;
}

const getRecursoTurmaIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ["recursoTurma", id],
		queryFn: () => getRecursoTurma(id),
	});

const getTurmaByIdQueryOptions = (id: number) =>
	queryOptions({
		queryKey: ["turmaById", id],
		queryFn: () => getTurmaById(id),
	});

export const Route = createFileRoute("/student/turma/$id")({
	component: RouteComponent,
	loader: async ({ params, context }) => {
		const { queryClient } = context;
		const { id } = params;

		await Promise.all([
			queryClient.ensureQueryData(getRecursoTurmaIdQueryOptions(Number(id))),
			queryClient.ensureQueryData(getTurmaByIdQueryOptions(Number(id))),
		]);
	},
});

function RouteComponent() {
	const { id } = useParams({
		from: "/student/turma/$id",
	});
	const [recursoData, turmaData] = useSuspenseQueries({
		queries: [
			getRecursoTurmaIdQueryOptions(Number(id)),
			getTurmaByIdQueryOptions(Number(id)),
		],
	});

	const [isVideoOpen, setIsVideoOpen] = useState(false);
	const [selectedVideo, setSelectedVideo] = useState<VideoRecurso | null>(null);

	const navigate = useNavigate();

	const TurmaItem: turmaItem = {
		nome: turmaData.data.nome,
		data_inicial: turmaData.data.data_inicio,
		data_conclusao: turmaData.data.data_conclusao,
	};

	const training: Treinamento = {
		nome: turmaData.data.treinamento_nome,
	};

	const classStarted = true;

	const availableResources = recursoData.data
		.filter(() => true)
		.map((resource) => {
			return {
				id: resource.id,
				name: resource.nome,
				type: resource.tipo,
				url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
			};
		});

	function handleLogout(): void {
		localStorage.removeItem("access_token");
		localStorage.removeItem("role");
		navigate({ to: "/auth/login" });
	}

	function handleResourceClick({
		tipo,
		url,
	}: {
		tipo: string;
		url: string;
	}): void {
		if (tipo === "VIDEO") {
			setSelectedVideo({ tipo, url });
			setIsVideoOpen(true);
		}
	}

	function getResourceIcon(tipo: string): React.ReactNode {
		switch (tipo) {
			case "VIDEO":
				return <Video className="w-5 h-5" />;
			case "PDF":
				return <FileText className="w-5 h-5" />;
			case "ZIP":
				return <File className="w-5 h-5" />;
			default:
				return <FileText className="w-5 h-5" />;
		}
	}

	if (!TurmaItem) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Turma não encontrada</p>
			</div>
		);
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
							<p className="text-xs text-muted-foreground">Recursos da Turma</p>
						</div>
					</div>
					<Button variant="outline" onClick={handleLogout}>
						<LogOut className="w-4 h-4 mr-2" />
						Sair
					</Button>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-6 py-8">
				<Button
					variant="ghost"
					onClick={() => navigate({ to: "/student/dashboard" })}
					className="mb-6"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Voltar para Minhas Turmas
				</Button>

				<div className="mb-8">
					<h2 className="text-2xl font-bold text-foreground mb-2">
						{TurmaItem.nome}
					</h2>
					<p className="text-muted-foreground">{training?.nome}</p>
					<p className="text-sm text-muted-foreground mt-1">
						{TurmaItem.data_inicial}{" "}
						{TurmaItem.data_conclusao && `até ${TurmaItem.data_conclusao}`}
					</p>
				</div>

				{!classStarted && (
					<Card className="mb-6 bg-primary/5 border-primary/20">
						<CardContent className="pt-6">
							<p className="text-sm text-foreground">
								Esta turma ainda não foi iniciada. Você tem acesso apenas aos
								recursos de preparação.
							</p>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Recursos Disponíveis</CardTitle>
					</CardHeader>
					<CardContent>
						{availableResources.length === 0 ? (
							<p className="text-center text-muted-foreground py-8">
								Nenhum recurso disponível no momento
							</p>
						) : (
							<div className="space-y-3">
								{availableResources.map((resource) => (
									<div
										key={resource.id}
										className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
									>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
												{getResourceIcon(resource.type)}
											</div>
											<div>
												<p className="font-medium text-foreground">
													{resource.name}
												</p>
												<p className="text-sm text-muted-foreground">
													{resource.type}
												</p>
											</div>
										</div>
										<Button
											size="sm"
											onClick={() =>
												handleResourceClick({
													tipo: resource.type,
													url: resource.url,
												})
											}
										>
											{resource.type === "VIDEO" ? (
												<>
													<Play className="w-4 h-4 mr-2" />
													Assistir
												</>
											) : (
												<>
													<Download className="w-4 h-4 mr-2" />
													Baixar
												</>
											)}
										</Button>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</main>

			<Dialog open={isVideoOpen} onOpenChange={() => setIsVideoOpen(false)}>
				<DialogContent className="max-w-4xl">
					<DialogHeader>
						<DialogTitle>{selectedVideo?.nome}</DialogTitle>
					</DialogHeader>
					<div className="aspect-video w-full">
						<iframe
							width="100%"
							height="100%"
							src={selectedVideo?.url}
							title={selectedVideo?.nome}
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							className="rounded-lg"
						></iframe>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
