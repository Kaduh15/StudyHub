import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { mockClasses, mockTrainings } from "@/data/mock";

export const Route = createFileRoute("/admin/turmas")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { queryClient } = context;

		const data = await queryClient.fetchQuery({
			queryKey: ["turmas"],
			queryFn: getTurmas,
		});

		return data;
	},
});

const columns = [
	{ key: "nome", label: "Nome" },
	{ key: "treinamento_nome", label: "Treinamento" },
	{ key: "data_inicio", label: "Data Início" },
	{ key: "data_conclusao", label: "Data Conclusão" },
];

function RouteComponent() {
	const data = useLoaderData({
		from: "/admin/turmas",
	});

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<any>(null);
	const [formData, setFormData] = useState({
		name: "",
		trainingId: "",
		startDate: "",
		endDate: "",
		accessLink: "",
	});

	const handleEdit = (item: any) => {
		setEditingItem(item);
		setFormData({
			name: item.name,
			trainingId: item.trainingId.toString(),
			startDate: item.startDate,
			endDate: item.endDate,
			accessLink: item.accessLink,
		});
		setIsDialogOpen(true);
	};

	const handleDelete = (item: any) => {
		toast.success("Turma deletada com sucesso");
	};

	const handleSave = () => {
		if (editingItem) {
			toast.success("Turma atualizada com sucesso");
		} else {
			toast.success("Turma criada com sucesso");
		}
		setIsDialogOpen(false);
		setEditingItem(null);
		setFormData({
			name: "",
			trainingId: "",
			startDate: "",
			endDate: "",
			accessLink: "",
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
					data={data}
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
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="Ex: Turma 2024-01"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="training">Treinamento</Label>
							<Select
								value={formData.trainingId}
								onValueChange={(value) =>
									setFormData({ ...formData, trainingId: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione um treinamento" />
								</SelectTrigger>
								<SelectContent>
									{mockTrainings.map((training) => (
										<SelectItem
											key={training.id}
											value={training.id.toString()}
										>
											{training.name}
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
									value={formData.startDate}
									onChange={(e) =>
										setFormData({ ...formData, startDate: e.target.value })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="endDate">Data Conclusão</Label>
								<Input
									type="date"
									value={formData.endDate}
									onChange={(e) =>
										setFormData({ ...formData, endDate: e.target.value })
									}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="accessLink">Link de Acesso</Label>
							<Input
								value={formData.accessLink}
								onChange={(e) =>
									setFormData({ ...formData, accessLink: e.target.value })
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
