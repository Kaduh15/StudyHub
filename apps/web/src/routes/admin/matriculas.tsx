import {
	queryOptions,
	useMutation,
	useQueryClient,
	useSuspenseQueries,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { id } from "zod/v4/locales";
import { getAlunos } from "@/api/aluno";
import {
	createMatricula,
	deleteMatricula,
	getMatriculas,
	updateMatricula,
} from "@/api/matricula";
import { getTurmas } from "@/api/turmas";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const matriculaQueryOption = queryOptions({
	queryKey: ["matriculas"],
	queryFn: getMatriculas,
});

const alunoQueryOption = queryOptions({
	queryKey: ["alunos"],
	queryFn: getAlunos,
});

const turmaQueryOptions = queryOptions({
	queryKey: ["turmas"],
	queryFn: getTurmas,
});

export const Route = createFileRoute("/admin/matriculas")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { queryClient } = context;

		await Promise.all([
			queryClient.ensureQueryData(matriculaQueryOption),
			queryClient.ensureQueryData(alunoQueryOption),
			queryClient.ensureQueryData(turmaQueryOptions),
		]);
	},
});

const columns = [
	{ key: "aluno_nome", label: "Aluno" },
	{ key: "turma_nome", label: "Turma" },
];

function RouteComponent() {
	const [initialMatriculas, initialAlunos, initialTurmas] = useSuspenseQueries({
		queries: [matriculaQueryOption, alunoQueryOption, turmaQueryOptions],
	});

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<{
		id: number;
		aluno: number;
		turma: number;
	} | null>(null);
	const [formData, setFormData] = useState({
		id: 0,
		aluno: 0,
		turma: 0,
	});

	const queryClient = useQueryClient();

	const createMatriculaMutation = useMutation({
		mutationFn: createMatricula,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["matriculas"] });

			toast.success("Matrícula criada com sucesso");
		},
		onError: () => {
			toast.error("Erro ao criar matrícula");
		},
	});

	const updateMatriculaMutation = useMutation({
		mutationFn: (data: { id: number; aluno: number; turma: number }) =>
			updateMatricula(data.id, {
				aluno: data.aluno,
				turma: data.turma,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["matriculas"] });

			toast.success("Matrícula atualizada com sucesso");
		},
		onError: () => {
			toast.error("Erro ao atualizar matrícula");
		},
	});

	const deleteMatriculaMutation = useMutation({
		mutationFn: deleteMatricula,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["matriculas"] });

			toast.success("Matrícula deletada com sucesso");
		},
		onError: () => {
			toast.error("Erro ao deletar matrícula");
		},
	});

	const data = initialMatriculas.data.map((m) => {
		return {
			id: m.id,
			aluno: m.aluno,
			turma: m.turma,
			aluno_nome: m.aluno_nome,
			turma_nome: m.turma_nome,
		};
	});

	const handleEdit = (item: { aluno: number; turma: number; id: number }) => {
		setEditingItem(item);
		setFormData({
			id: item.id,
			aluno: item.aluno,
			turma: item.turma,
		});
		setIsDialogOpen(true);
	};

	const handleDelete = (item: { id: number }) => {
		deleteMatriculaMutation.mutate(item.id);
	};

	const handleSave = () => {
		if (editingItem) {
			updateMatriculaMutation.mutate({
				id: formData.id,
				aluno: formData.aluno,
				turma: formData.turma,
			});
		} else {
			createMatriculaMutation.mutate({
				aluno: formData.aluno,
				turma: formData.turma,
			});
		}
		setIsDialogOpen(false);
		setEditingItem(null);
		setFormData({ aluno: 0, turma: 0, id: 0 });
	};

	return (
		<main className="flex-1 p-8">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Matrículas</h1>
						<p className="text-muted-foreground mt-1">
							Gerencie as matrículas dos alunos
						</p>
					</div>
					<Button onClick={() => setIsDialogOpen(true)}>
						<Plus className="w-4 h-4 mr-2" />
						Nova Matrícula
					</Button>
				</div>

				<DataTable
					columns={columns}
					data={data}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingItem ? "Editar Matrícula" : "Nova Matrícula"}
						</DialogTitle>
						<DialogDescription>Vincule um aluno a uma turma</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="aluno">Aluno</Label>
							<Select
								value={formData.aluno.toString()}
								onValueChange={(value) =>
									setFormData({ ...formData, aluno: Number(value) })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione um aluno" />
								</SelectTrigger>
								<SelectContent>
									{initialAlunos.data.map((aluno) => (
										<SelectItem key={aluno.id} value={aluno.id.toString()}>
											{aluno.nome}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="turma">Turma</Label>
							<Select
								value={formData.turma.toString()}
								onValueChange={(value) =>
									setFormData({ ...formData, turma: Number(value) })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione uma turma" />
								</SelectTrigger>
								<SelectContent>
									{initialTurmas.data.map((turma) => (
										<SelectItem key={turma.id} value={turma.id.toString()}>
											{turma.nome}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
							Cancelar
						</Button>
						<Button onClick={handleSave}>Salvar</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	);
}
