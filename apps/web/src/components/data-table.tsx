import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface Column {
	key: string;
	label: string;
}

interface DataTableProps<T = Record<string, unknown>> {
	columns: Column[];
	data: T[];
	onEdit: (item: T) => void;
	onDelete: (item: T) => void;
}

export const DataTable = ({
	columns,
	data,
	onEdit,
	onDelete,
}: DataTableProps) => {
	return (
		<div className="rounded-lg border border-border bg-card">
			<Table>
				<TableHeader>
					<TableRow>
						{columns.map((column) => (
							<TableHead key={column.key}>{column.label}</TableHead>
						))}
						<TableHead className="text-right">Ações</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={columns.length + 1}
								className="text-center text-muted-foreground py-8"
							>
								Nenhum registro encontrado
							</TableCell>
						</TableRow>
					) : (
						data.map((item, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: depois eu altero isso
							<TableRow key={index}>
								{columns.map((column) => (
									<TableCell key={column.key}>
										{String(item[column.key] ?? "")}
									</TableCell>
								))}
								<TableCell className="text-right">
									<div className="flex justify-end gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onEdit(item)}
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onClick={() => onDelete(item)}
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
};
