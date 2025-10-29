import {
	queryOptions,
	useMutation,
	useQueryClient,
	useSuspenseQueries,
} from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import {
	createRecurso,
	deleteRecurso,
	type GetRecursoSchema,
	getRecursos,
	updateRecurso,
} from "@/api/recurso";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const recursoQueryOptions = queryOptions({
	queryKey: ["recursos"],
	queryFn: getRecursos,
});

const turmaQueryOptions = queryOptions({
	queryKey: ["turmas"],
	queryFn: getTurmas,
});

export const Route = createFileRoute("/admin/recursos")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { queryClient } = context;

		await queryClient.ensureQueryData(recursoQueryOptions);

		await queryClient.ensureQueryData(turmaQueryOptions);
	},
});

const columns = [
	{ key: "nome", label: "Nome" },
	{ key: "turma_nome", label: "Turma" },
	{ key: "tipo", label: "Tipo" },
	{ key: "draft", label: "Rascunho" },
];

function RouteComponent() {
	const [initialRecursos, initialTurmas] = useSuspenseQueries({
		queries: [recursoQueryOptions, turmaQueryOptions],
	});

	const queryClient = useQueryClient();

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<GetRecursoSchema | null>(null);
	const [formData, setFormData] = useState({
		nome: "",
		turma: 0,
		turma_nome: "",
		descricao: "",
		tipo: "PDF",
		url: "",
		acesso_previo: false,
		draft: true,
	});

	const inputNameId = useId();
	const inputDraftId = useId();
	const inputAcessoPrevioId = useId();
	const inputUrlId = useId();

	const createRecursoMutation = useMutation({
		mutationFn: createRecurso,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recursos"] });

			toast.success("Recurso criado com sucesso");
		},
		onError: () => {
			toast.error("Erro ao criar recurso");
		},
	});

	const updateRecursoMutation = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: number;
			data: Partial<{
				nome: string;
				turma: number;
				descricao: string | null;
				tipo: "PDF" | "VIDEO" | "ZIP";
				url: string | null;
				acesso_previo: boolean;
				draft: boolean;
			}>;
		}) =>
			updateRecurso(id, {
				nome: data.nome,
				turma: data.turma,
				descricao: data.descricao,
				tipo: data.tipo,
				acesso_previo: data.acesso_previo,
				draft: data.draft,
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recursos"] });

			toast.success("Recurso atualizado com sucesso");
		},
		onError: () => {
			toast.error("Erro ao atualizar recurso");
		},
	});

	const deleteRecursoMutation = useMutation({
		mutationFn: deleteRecurso,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recursos"] });

			toast.success("Recurso deletado com sucesso");
		},
		onError: () => {
			toast.error("Erro ao deletar recurso");
		},
	});

	const data = initialRecursos.data.map((r) => {
		return {
			id: r.id,
			nome: r.nome,
			turma_nome: r.turma_nome,
			turma: r.turma,
			tipo: r.tipo,
			draft: r.draft ? "Sim" : "Não",
			acesso_previo: r.acesso_previo,
		};
	});

	const handleEdit = (item: Record<string, unknown>) => {
		const typedItem = item as GetRecursoSchema & {
			url: string;
		};
		setEditingItem(typedItem);
		setFormData({
			nome: typedItem.nome,
			turma: typedItem.turma,
			turma_nome: typedItem.turma_nome,
			tipo: typedItem.tipo,
			url: typedItem.url || "",
			acesso_previo: typedItem.acesso_previo,
			draft: typedItem.draft,
			descricao: typedItem.descricao || "",
		});
		setIsDialogOpen(true);
	};

	const handleDelete = (item: { id: number }) => {
		deleteRecursoMutation.mutate(item.id);
	};

	const handleSave = () => {
		if (editingItem) {
			updateRecursoMutation.mutate({
				id: editingItem.id,
				data: {
					nome: formData.nome,
					turma: formData.turma,
					tipo: formData.tipo as "PDF" | "VIDEO" | "ZIP",
					acesso_previo: Boolean(formData.acesso_previo),
					descricao: formData.descricao,
					draft:
						typeof formData.draft === "string"
							? formData.draft === "Sim"
							: false,
				},
			});
		} else {
			createRecursoMutation.mutate({
				nome: formData.nome,
				turma: formData.turma,
				tipo: formData.tipo as "PDF" | "VIDEO" | "ZIP",
				acesso_previo: Boolean(formData.acesso_previo),
				descricao: formData.descricao,
				draft: formData.draft,
			});
		}
		setIsDialogOpen(false);
		setEditingItem(null);
		setFormData({
			nome: "",
			turma: 0,
			turma_nome: "",
			tipo: "PDF",
			url: "",
			acesso_previo: false,
			draft: false,
			descricao: "",
		});
	};

	return (
		<main className="flex-1 p-8">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-foreground">Recursos</h1>
						<p className="text-muted-foreground mt-1">
							Gerencie os recursos das turmas
						</p>
					</div>
					<Button onClick={() => setIsDialogOpen(true)}>
						<Plus className="w-4 h-4 mr-2" />
						Novo Recurso
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
							{editingItem ? "Editar Recurso" : "Novo Recurso"}
						</DialogTitle>
						<DialogDescription>Preencha os dados do recurso</DialogDescription>
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
								placeholder="Ex: Apostila Python"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="class">Turma</Label>
							<Select
								value={formData.turma.toString()}
								onValueChange={(value) =>
									setFormData({ ...formData, turma: parseInt(value, 10) })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione uma turma" />
								</SelectTrigger>
								<SelectContent>
									{initialTurmas.data.map((cls) => (
										<SelectItem key={cls.id} value={cls.id.toString()}>
											{cls.nome}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="tipo">Tipo</Label>
							<Select
								value={formData.tipo}
								onValueChange={(value) =>
									setFormData({ ...formData, tipo: value })
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="VIDEO">VIDEO</SelectItem>
									<SelectItem value="PDF">PDF</SelectItem>
									<SelectItem value="ZIP">ZIP</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor={inputUrlId}>URL</Label>
							<Input
								id={inputUrlId}
								value={formData.url}
								onChange={(e) =>
									setFormData({ ...formData, url: e.target.value })
								}
								placeholder="https://..."
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor={inputAcessoPrevioId}>Acesso Prévio</Label>
							<Switch
								id={inputAcessoPrevioId}
								checked={formData.acesso_previo}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, acesso_previo: checked })
								}
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor={inputDraftId}>Rascunho</Label>
							<Switch
								id={inputDraftId}
								checked={formData.draft}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, draft: checked })
								}
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
