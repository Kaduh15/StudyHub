import { Link, useNavigate } from "@tanstack/react-router";
import {
	BookOpen,
	FileText,
	GraduationCap,
	LogOut,
	UserPlus,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";

const menuItems = [
	{ title: "Treinamentos", icon: BookOpen, path: "/admin/treinamentos" },
	{ title: "Turmas", icon: Users, path: "/admin/turmas" },
	{ title: "Recursos", icon: FileText, path: "/admin/recursos" },
	{ title: "Alunos", icon: UserPlus, path: "/admin/alunos" },
	{ title: "Matrículas", icon: GraduationCap, path: "/admin/matriculas" },
];

export const AdminSidebar = () => {
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem("access_token");
		localStorage.removeItem("role");

		navigate({
			to: "/auth/login",
			replace: true,
		});
	};

	return (
		<aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen sticky top-0">
			<div className="p-6 border-b border-sidebar-border">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
						<GraduationCap className="w-6 h-6 text-primary-foreground" />
					</div>
					<div>
						<h1 className="text-lg font-bold text-sidebar-foreground">
							StudyHub
						</h1>
						<p className="text-xs text-muted-foreground">Administrador</p>
					</div>
				</div>
			</div>

			<nav className="flex-1 p-4 space-y-1">
				{menuItems.map((item) => (
					<Link
						key={item.path}
						to={item.path}
						className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
					>
						<item.icon className="w-5 h-5" />
						<span>{item.title}</span>
					</Link>
				))}
			</nav>

			<div className="flex gap-4 w-[200px] p-4 border-t border-sidebar-border">
				<Button
					variant="outline"
					className="w-full justify-start gap-3"
					onClick={handleLogout}
				>
					<LogOut className="w-5 h-5" />
					Sair
				</Button>
				<ModeToggle />
			</div>
		</aside>
	);
};
