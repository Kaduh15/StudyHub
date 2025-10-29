import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Info, Plus } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { getAlunos } from "@/api/aluno";
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

export const Route = createFileRoute("/admin/alunos")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { queryClient } = context;

		const data = await queryClient.fetchQuery({
			queryKey: ["alunos"],
			queryFn: getAlunos,
		});

		return data;
	},
});

const columns = [
	{ key: "nome", label: "Nome" },
	{ key: "email", label: "E-mail" },
	{ key: "telefone", label: "Telefone" },
];

function RouteComponent() {
	const data = useLoaderData({
		from: "/admin/alunos",
	});

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<any>(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
	});

	const inputNameId = useId();
	const inputEmailId = useId();
	const inputPhoneId = useId();

	const handleEdit = (item: any) => {
		setEditingItem(item);
		setFormData({ name: item.name, email: item.email, phone: item.phone });
		setIsDialogOpen(true);
	};

	const handleDelete = (item: any) => {
		// setData(data.filter((d) => d.id !== item.id));
		toast.success("Aluno deletado com sucesso");
	};

	const handleSave = () => {
		if (editingItem) {
			// setData(
			// 	data.map((d) => (d.id === editingItem.id ? { ...d, ...formData } : d)),
			// );
			toast.success("Aluno atualizado com sucesso");
		} else {
			// setData([...data, { id: Date.now(), ...formData }]);
			toast.success("Aluno criado com sucesso");
		}
		setIsDialogOpen(false);
		setEditingItem(null);
		setFormData({ name: "", email: "", phone: "" });
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
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
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
								value={formData.phone}
								onChange={(e) =>
									setFormData({ ...formData, phone: e.target.value })
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
