import {
	queryOptions,
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Info, Plus } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { createAluno, deleteAluno, getAlunos, updateAluno } from "@/api/aluno";
import { DataTable } from "@/components/data-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

interface Aluno extends Record<string, unknown> {
	id: number;
	nome: string;
	email: string;
	telefone: string | null;
}

type AlunoFormData = {
	nome: string;
	email: string;
	telefone: string;
};

type UpdateAlunoData = Partial<Omit<Aluno, "id">>;

const alunoQueryOptions = queryOptions({
	queryKey: ["alunos"],
	queryFn: getAlunos,
});

export const Route = createFileRoute("/admin/alunos")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { queryClient } = context;

		await queryClient.ensureQueryData(alunoQueryOptions);
	},
});

const columns = [
	{ key: "nome", label: "Nome" },
	{ key: "email", label: "E-mail" },
	{ key: "telefone", label: "Telefone" },
];

function RouteComponent() {
	const { data } = useSuspenseQuery(alunoQueryOptions);

	const queryClient = useQueryClient();

	const createAlunoMutation = useMutation({
		mutationFn: createAluno,
		onSuccess: (data: Aluno) => {
			queryClient.setQueryData<Aluno[]>(["alunos"], (oldData = []) => {
				return [...oldData, data];
			});

			toast.success("Aluno criado com sucesso");
			toast(`Senha padrão: ${data.nome.toLowerCase().slice(0, 3)}@123`, {
				description: "Peça para o aluno alterar a senha no primeiro login",
				duration: 20000,
			});
		},
		onError: () => {
			toast.error("Erro ao criar aluno");
		},
	});

	const deleteAlunoMutation = useMutation({
		mutationFn: deleteAluno,
		onSuccess: (_, id: number) => {
			queryClient.setQueryData<Aluno[]>(["alunos"], (oldData = []) => {
				return oldData.filter((aluno) => aluno.id !== id);
			});

			toast.success("Aluno deletado com sucesso");
		},
		onError: () => {
			toast.error("Erro ao deletar aluno");
		},
	});

	const updateAlunoMutation = useMutation({
		mutationFn: ({ id, aluno }: { id: number; aluno: UpdateAlunoData }) =>
			updateAluno(id, aluno),
		onSuccess: (data: Aluno) => {
			queryClient.setQueryData<Aluno[]>(["alunos"], (oldData = []) => {
				return oldData.map((aluno) => (aluno.id === data.id ? data : aluno));
			});

			toast.success("Aluno atualizado com sucesso");
		},
		onError: () => {
			toast.error("Erro ao atualizar aluno");
		},
	});

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<Aluno | null>(null);
	const [formData, setFormData] = useState<AlunoFormData>({
		nome: "",
		email: "",
		telefone: "",
	});

	const inputNameId = useId();
	const inputEmailId = useId();
	const inputPhoneId = useId();

	const handleEdit = (item: Aluno) => {
		setEditingItem(item);
		setFormData({
			nome: item.nome,
			email: item.email,
			telefone: item.telefone ?? "",
		});
		setIsDialogOpen(true);
	};

	const handleDelete = (item: Aluno) => {
		deleteAlunoMutation.mutate(item.id);
	};

	const handleSave = () => {
		if (editingItem) {
			updateAlunoMutation.mutate({
				id: editingItem.id,
				aluno: {
					email: formData.email,
					nome: formData.nome,
					telefone: formData.telefone || null,
				},
			});
		} else {
			createAlunoMutation.mutate({
				email: formData.email,
				nome: formData.nome,
				telefone: formData.telefone || null,
			});
		}
		setIsDialogOpen(false);
		setEditingItem(null);
		setFormData({ nome: "", email: "", telefone: "" });
	};

	return (
		<main className="flex-1 p-8">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Alunos</h1>
						<p className="text-muted-foreground mt-1">
							Gerencie os alunos cadastrados
						</p>
					</div>
					<Button onClick={() => setIsDialogOpen(true)}>
						<Plus className="w-4 h-4 mr-2" />
						Novo Aluno
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
							{editingItem ? "Editar Aluno" : "Novo Aluno"}
						</DialogTitle>
						<DialogDescription>Preencha os dados do aluno</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						{!editingItem && (
							<Alert>
								<Info className="h-4 w-4" />
								<AlertDescription>
									A senha padrão será gerada automaticamente
								</AlertDescription>
							</Alert>
						)}
						<div className="space-y-2">
							<Label htmlFor={inputNameId}>Nome</Label>
							<Input
								id={inputNameId}
								value={formData.nome}
								onChange={(e) =>
									setFormData({ ...formData, nome: e.target.value })
								}
								placeholder="Ex: João Silva"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor={inputEmailId}>E-mail</Label>
							<Input
								id={inputEmailId}
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								placeholder="joao@email.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor={inputPhoneId}>Telefone</Label>
							<Input
								id={inputPhoneId}
								value={formData.telefone}
								onChange={(e) =>
									setFormData({ ...formData, telefone: e.target.value })
								}
								placeholder="(11) 98765-4321"
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
