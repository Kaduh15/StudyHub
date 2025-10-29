import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getAlunos } from "@/api/aluno";
import { getMatriculas } from "@/api/matricula";
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
import { mockClasses, mockEnrollments, mockStudents } from "@/data/mock";

export const Route = createFileRoute("/admin/matriculas")({
	component: RouteComponent,
	loader: async ({ context }) => {
		const { queryClient } = context;

		const matriculas = await queryClient.fetchQuery({
			queryKey: ["matriculas"],
			queryFn: getMatriculas,
		});
		const alunos = await queryClient.fetchQuery({
			queryKey: ["alunos"],
			queryFn: getAlunos,
		});
		const turmas = await queryClient.fetchQuery({
			queryKey: ["turmas"],
			queryFn: getTurmas,
		});
		return {
			matriculas,
			alunos,
			turmas,
		};
	},
});

const columns = [
	{ key: "aluno_nome", label: "Aluno" },
	{ key: "turma_nome", label: "Turma" },
];

function RouteComponent() {
	const {
		matriculas: initialMatriculas,
		alunos: initialAlunos,
		turmas: initialTurmas,
	} = useLoaderData({
		from: "/admin/matriculas",
	});

	const data = initialMatriculas.map((m) => {
		const student = initialAlunos.find((a) => a.id === m.aluno);
		const classItem = initialTurmas.find((t) => t.id === m.turma);
		return {
			aluno_nome: student ? student.nome : "Desconhecido",
			turma_nome: classItem ? classItem.nome : "Desconhecido",
		};
	});

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<any>(null);
	const [formData, setFormData] = useState({ studentId: "", classId: "" });

	const handleEdit = (item: any) => {
		setEditingItem(item);
		setFormData({
			studentId: item.studentId.toString(),
			classId: item.classId.toString(),
		});
		setIsDialogOpen(true);
	};

	const handleDelete = (item: any) => {
		// setData(data.filter((d) => d.id !== item.id));
		toast.success("Matrícula deletada com sucesso");
	};

	const handleSave = () => {
		const studentName =
			mockStudents.find((s) => s.id === parseInt(formData.studentId))?.name ||
			"";
		const className =
			mockClasses.find((c) => c.id === parseInt(formData.classId, 10))?.name ||
			"";

		if (editingItem) {
			// setData(
			// 	data.map((d) =>
			// 		d.id === editingItem.id
			// 			? {
			// 					...d,
			// 					studentId: parseInt(formData.studentId, 10),
			// 					classId: parseInt(formData.classId, 10),
			// 					studentName,
			// 					className,
			// 				}
			// 			: d,
			// 	),
			// );
			toast.success("Matrícula atualizada com sucesso");
		} else {
			// setData([
			// 	...data,
			// 	{
			// 		id: Date.now(),
			// 		studentId: parseInt(formData.studentId, 10),
			// 		classId: parseInt(formData.classId, 10),
			// 		studentName,
			// 		className,
			// 	},
			// ]);
			toast.success("Matrícula criada com sucesso");
		}
		setIsDialogOpen(false);
		setEditingItem(null);
		setFormData({ studentId: "", classId: "" });
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
							<Label htmlFor="student">Aluno</Label>
							<Select
								value={formData.studentId}
								onValueChange={(value) =>
									setFormData({ ...formData, studentId: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione um aluno" />
								</SelectTrigger>
								<SelectContent>
									{mockStudents.map((student) => (
										<SelectItem key={student.id} value={student.id.toString()}>
											{student.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="class">Turma</Label>
							<Select
								value={formData.classId}
								onValueChange={(value) =>
									setFormData({ ...formData, classId: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione uma turma" />
								</SelectTrigger>
								<SelectContent>
									{mockClasses.map((cls) => (
										<SelectItem key={cls.id} value={cls.id.toString()}>
											{cls.name}
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
