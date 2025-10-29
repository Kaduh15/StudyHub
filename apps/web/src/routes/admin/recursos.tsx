import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { type getRecursoSchema, getRecursos } from "@/api/recurso";
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

export const Route = createFileRoute("/admin/recursos")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { queryClient } = context;

		const recursos = await queryClient.fetchQuery({
			queryKey: ["recursos"],
			queryFn: getRecursos,
		});
		const turmas = await queryClient.fetchQuery({
			queryKey: ["turmas"],
			queryFn: getTurmas,
		});

		return {
			recursos,
			turmas,
		};
	},
});

const columns = [
	{ key: "nome", label: "Nome" },
	{ key: "turma_nome", label: "Turma" },
	{ key: "tipo", label: "Tipo" },
	{ key: "draft", label: "Rascunho" },
];

function RouteComponent() {
	const { recursos: initialRecursos, turmas: initialTurmas } = useLoaderData({
		from: "/admin/recursos",
	});

	const data = initialRecursos.map((r) => {
		const classItem = initialTurmas.find((t) => t.id === r.turma);
		return {
			id: r.id,
			nome: r.nome,
			turma_nome: classItem?.nome || "",
			turma: r.turma,
			tipo: r.tipo,
			draft: r.draft ? "Sim" : "Não",
		};
	});

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<any>(null);
	const [formData, setFormData] = useState({
		nome: "",
		turma: 0,
		turma_nome: "",
		tipo: "PDF",
		url: "",
		acesso_previo: false,
		draft: false,
	});

	const inputNameId = useId();
	const inputDraftId = useId();
	const inputAcessoPrevioId = useId();
	const inputUrlId = useId();

	const handleEdit = (item: Record<string, unknown>) => {
		const typedItem = item as getRecursoSchema & {
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
		});
		setIsDialogOpen(true);
	};

	const handleDelete = (item: any) => {
		// setData(data.filter((d) => d.id !== item.id));
		toast.success("Recurso deletado com sucesso");
	};

	const handleSave = () => {
		if (editingItem) {
			toast.success("Recurso atualizado com sucesso");
		} else {
			toast.success("Recurso criado com sucesso");
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
									{initialTurmas.map((cls) => (
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
