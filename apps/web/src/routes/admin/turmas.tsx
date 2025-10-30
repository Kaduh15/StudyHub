import {
	queryOptions,
	useMutation,
	useQueryClient,
	useSuspenseQueries,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getTreinamentos } from "@/api/treinamentos";
import { createTurma, deleteTurma, getTurmas, updateTurma } from "@/api/turmas";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type Turma = {
	id: number;
	nome: string;
	treinamento: number;
	treinamento_nome: string;
	data_inicio: string;
	data_conclusao: string;
	link_acesso: string;
};

type TurmaFormData = {
	nome: string;
	treinamento: number;
	data_inicio: string;
	data_conclusao: string;
	link_acesso: string;
};

const turmaQueryOptions = queryOptions({
	queryKey: ["turmas"],
	queryFn: getTurmas,
});

const treinamentoQueryOptions = queryOptions({
	queryKey: ["treinamentos"],
	queryFn: getTreinamentos,
});

export const Route = createFileRoute("/admin/turmas")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { queryClient } = context;

		await queryClient.ensureQueryData(turmaQueryOptions);
	},
});

const columns = [
	{ key: "nome", label: "Nome" },
	{ key: "treinamento_nome", label: "Treinamento" },
	{ key: "data_inicio", label: "Data Início" },
	{ key: "data_conclusao", label: "Data Conclusão" },
];

function RouteComponent() {
	const [turmas, treinamentos] = useSuspenseQueries({
		queries: [turmaQueryOptions, treinamentoQueryOptions],
	});

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<Turma | null>(null);
	const [formData, setFormData] = useState<TurmaFormData>({
		nome: "",
		treinamento: 0,
		data_inicio: "",
		data_conclusao: "",
		link_acesso: "",
	});

	const queryClient = useQueryClient();

	const createTurmaMutation = useMutation({
		mutationFn: createTurma,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["turmas"] });

			toast.success("Turma criada com sucesso");
		},
		onError: () => {
			toast.error("Erro ao criar a turma");
		},
	});

	const updateTurmaMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: Parameters<typeof updateTurma>[1];
		}) => updateTurma(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["turmas"] });

			toast.success("Turma atualizada com sucesso");
		},
		onError: () => {
			toast.error("Erro ao atualizar a turma");
		},
	});

	const deleteTurmaMutation = useMutation({
		mutationFn: deleteTurma,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["turmas"] });

			toast.success("Turma deletada com sucesso");
		},
		onError: () => {
			toast.error("Erro ao deletar a turma");
		},
	});

	const handleEdit = (item: Turma) => {
		setEditingItem(item);
		setFormData({
			nome: item.nome,
			treinamento: item.treinamento,
			data_inicio: item.data_inicio,
			data_conclusao: item.data_conclusao,
			link_acesso: item.link_acesso,
		});
		setIsDialogOpen(true);
	};

	const handleDelete = (item: { id: number }) => {
		deleteTurmaMutation.mutate(item.id);
	};

	const handleSave = () => {
		if (editingItem) {
			updateTurmaMutation.mutate({
				id: editingItem.id,
				data: {
					nome: formData.nome,
					treinamento: formData.treinamento,
					data_inicio: formData.data_inicio,
					data_conclusao: formData.data_conclusao,
					link_acesso: formData.link_acesso || null,
				},
			});
		} else {
			createTurmaMutation.mutate({
				nome: formData.nome,
				treinamento: formData.treinamento,
				data_inicio: formData.data_inicio,
				data_conclusao: formData.data_conclusao,
				link_acesso: formData.link_acesso || null,
			});
		}
		setIsDialogOpen(false);
		setEditingItem(null);
		setFormData({
			nome: "",
			treinamento: 0,
			data_inicio: "",
			data_conclusao: "",
			link_acesso: "",
		});
	};

	return (
		<main className="flex-1 p-8">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Turmas</h1>
						<p className="text-muted-foreground mt-1">
							Gerencie as turmas disponíveis
						</p>
					</div>
					<Button onClick={() => setIsDialogOpen(true)}>
						<Plus className="w-4 h-4 mr-2" />
						Nova Turma
					</Button>
				</div>

				<DataTable
					columns={columns}
					data={turmas.data}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingItem ? "Editar Turma" : "Nova Turma"}
						</DialogTitle>
						<DialogDescription>Preencha os dados da turma</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nome</Label>
							<Input
								value={formData.nome}
								onChange={(e) =>
									setFormData({ ...formData, nome: e.target.value })
								}
								placeholder="Ex: Turma 2024-01"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="training">Treinamento</Label>
							<Select
								value={formData.treinamento.toString()}
								onValueChange={(value) =>
									setFormData({ ...formData, treinamento: Number(value) })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione um treinamento" />
								</SelectTrigger>
								<SelectContent>
									{treinamentos.data.map((treinamento) => (
										<SelectItem
											key={treinamento.id}
											value={treinamento.id.toString()}
										>
											{treinamento.nome}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="startDate">Data Início</Label>
								<Input
									type="date"
									value={formData.data_inicio}
									onChange={(e) =>
										setFormData({ ...formData, data_inicio: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="endDate">Data Conclusão</Label>
								<Input
									type="date"
									value={formData.data_conclusao}
									onChange={(e) =>
										setFormData({ ...formData, data_conclusao: e.target.value })
									}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="link_acesso">Link de Acesso</Label>
							<Input
								value={formData.link_acesso}
								onChange={(e) =>
									setFormData({ ...formData, link_acesso: e.target.value })
								}
								placeholder="https://meet.google.com/..."
							/>
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
