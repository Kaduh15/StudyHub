import {
	queryOptions,
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import {
	createTreinamento,
	deleteTreinamento,
	getTreinamentos,
	updateTreinamento,
} from "@/api/treinamentos";
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
import { Textarea } from "@/components/ui/textarea";

type Treinamento = {
	id: number;
	nome: string;
	descricao: string;
};

type TreinamentoFormData = {
	nome: string;
	descricao: string;
};

type UpdateTreinamentoParams = {
	id: number;
	data: Partial<{
		nome: string;
		descricao: string | null;
	}>;
};

const treinamentoQueryOptions = queryOptions({
	queryKey: ["treinamentos"],
	queryFn: getTreinamentos,
});

export const Route = createFileRoute("/admin/treinamentos")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { queryClient } = context;

		await queryClient.ensureQueryData(treinamentoQueryOptions);
	},
});

const columns = [
	{ key: "nome", label: "Nome" },
	{ key: "descricao", label: "Descrição" },
];

function RouteComponent() {
	const { data } = useSuspenseQuery(treinamentoQueryOptions);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<Treinamento | null>(null);
	const [formData, setFormData] = useState<TreinamentoFormData>({
		nome: "",
		descricao: "",
	});

	const queryClient = useQueryClient();

	const createTreinamentoMutation = useMutation({
		mutationFn: createTreinamento,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["treinamentos"] });

			toast.success("Treinamento criado com sucesso");
		},
		onError: () => {
			toast.error("Erro ao criar o treinamento");
		},
	});

	const updateTreinamentoMutation = useMutation({
		mutationFn: ({ id, data }: UpdateTreinamentoParams) =>
			updateTreinamento(id, {
				nome: data.nome,
				descricao: data.descricao,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["treinamentos"] });

			toast.success("Treinamento atualizado com sucesso");
		},
		onError: () => {
			toast.error("Erro ao atualizar o treinamento");
		},
	});

	const deleteTreinamentoMutation = useMutation({
		mutationFn: deleteTreinamento,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["treinamentos"] });

			toast.success("Treinamento deletado com sucesso");
		},
		onError: () => {
			toast.error("Erro ao deletar o treinamento");
		},
	});

	const inputNameId = useId();
	const inputDescriptionId = useId();

	const handleEdit = (item: Treinamento) => {
		setEditingItem(item);
		setFormData({ nome: item.nome, descricao: item.descricao });
		setIsDialogOpen(true);
	};

	const handleDelete = (item: Pick<Treinamento, "id">) => {
		deleteTreinamentoMutation.mutate(item.id);
	};

	const handleSave = () => {
		if (editingItem) {
			updateTreinamentoMutation.mutate({
				id: editingItem.id,
				data: {
					nome: formData.nome,
					descricao: formData.descricao,
				},
			});
		} else {
			createTreinamentoMutation.mutate({
				nome: formData.nome,
				descricao: formData.descricao,
			});
		}
		setIsDialogOpen(false);
		setEditingItem(null);
		setFormData({ nome: "", descricao: "" });
	};

	return (
		<main className="flex-1 p-8">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Treinamentos</h1>
						<p className="text-muted-foreground mt-1">
							Gerencie os treinamentos disponíveis
						</p>
					</div>
					<Button onClick={() => setIsDialogOpen(true)}>
						<Plus className="w-4 h-4 mr-2" />
						Novo Treinamento
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
							{editingItem ? "Editar Treinamento" : "Novo Treinamento"}
						</DialogTitle>
						<DialogDescription>
							Preencha os dados do treinamento
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor={inputNameId}>Nome</Label>
							<Input
								id={inputNameId}
								value={formData.nome}
								onChange={(e) =>
									setFormData({ ...formData, nome: e.target.value })
								}
								placeholder="Ex: Python Básico"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor={inputDescriptionId}>Descrição</Label>
							<Textarea
								id={inputDescriptionId}
								value={formData.descricao}
								onChange={(e) =>
									setFormData({ ...formData, descricao: e.target.value })
								}
								placeholder="Descreva o treinamento"
								rows={4}
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
