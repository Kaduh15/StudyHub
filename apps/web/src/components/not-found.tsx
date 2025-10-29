import { Link } from "@tanstack/react-router";

export function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center ">
			<div className="text-center">
				<h1 className="mb-4 text-4xl font-bold">404</h1>
				<p className="mb-4 text-xl ">Oops! Pagina não encontrada</p>
				<Link
					to="/admin/turmas"
					className="text-blue-500 underline hover:text-blue-700"
				>
					Voltar para o Início
				</Link>
			</div>
		</div>
	);
}
