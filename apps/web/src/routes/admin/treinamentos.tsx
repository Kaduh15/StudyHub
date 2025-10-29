import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { getTreinamentos } from "@/api/treinamentos";
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

export const Route = createFileRoute("/admin/treinamentos")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { queryClient } = context;

		const data = await queryClient.fetchQuery({
			queryKey: ["treinamentos"],
			queryFn: getTreinamentos,
		});

		return data;
	},
});

const columns = [
	{ key: "nome", label: "Nome" },
	{ key: "descricao", label: "Descrição" },
];

function RouteComponent() {
	const data = useLoaderData({
		from: "/admin/treinamentos",
	});
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<any>(null);
	const [formData, setFormData] = useState({ name: "", description: "" });

	const inputNameId = useId();
	const inputDescriptionId = useId();

	const handleEdit = (item: any) => {
		setEditingItem(item);
		setFormData({ name: item.name, description: item.description });
		setIsDialogOpen(true);
	};

	const handleDelete = (item: any) => {
		// setData(data.filter((d) => d.id !== item.id));
		toast.success("Treinamento deletado com sucesso");
	};

	const handleSave = () => {
		if (editingItem) {
          // setData(
          // 	data.map((d) => (d.id === editingItem.id ? { ...d, ...formData } : d)),
          // );
			toast.success("Registro atualizado com sucesso");
		} else {
			// setData([...data, { id: Date.now(), ...formData }]);
			toast.success("Registro criado com sucesso");
		}
		setIsDialogOpen(false);
		setEditingItem(null);
		setFormData({ name: "", description: "" });
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
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="Ex: Python Básico"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor={inputDescriptionId}>Descrição</Label>
							<Textarea
								id={inputDescriptionId}
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
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
