/** biome-ignore-all lint/suspicious/noExplicitAny: depois corrijo */
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

interface DataTableProps {
	columns: any[];
	data: any[];
	onEdit: (item: any) => void;
	onDelete: (item: any) => void;
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
							<TableHead key={String(column.key)}>{column.label}</TableHead>
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
									<TableCell key={String(column.key)}>
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
