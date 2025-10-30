import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "./-hooks";
import { type LoginSchema, loginSchema } from "./-schema";

export const Route = createFileRoute("/auth/login")({
	component: RouteComponent,
	loader: async () => {
		const token = localStorage.getItem("access_token");
		const role = localStorage.getItem("role");

		if (token && role === "admin") {
			throw redirect({
				to: "/admin/treinamentos",
				replace: true,
			});
		} else if (token && role === "user") {
			throw redirect({
				to: "/student/dashboard",
				replace: true,
			});
		}
	},
});

function RouteComponent() {
	const {
		register,
		handleSubmit,
		formState: { errors, isLoading },
		setError,
	} = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
	});

	const login = useLogin();

	const router = useNavigate();

	const hasEmailError = !!errors.email?.message;
	const hasPasswordError = !!errors.password?.message;

	const onSubmit = (data: LoginSchema) => {
		login.mutate(data, {
			onSuccess: (res) => {
				toast.success("Bem-vindo de volta!");

				localStorage.setItem("access_token", res.access);
				localStorage.setItem("role", res.is_staff ? "admin" : "user");

				if (res.is_staff) {
					router({ to: "/admin/treinamentos" });
				} else {
					router({ to: "/student/dashboard" });
				}
			},
			onError: (err) => {
				setError("email", { message: " " });
				setError("password", { message: " " });
				toast.error(err.message);
			},
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="space-y-4 text-center">
					<div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
						<GraduationCap className="w-7 h-7 text-primary-foreground" />
					</div>
					<div>
						<CardTitle className="text-2xl font-bold">StudyHub</CardTitle>
						<CardDescription className="text-base mt-2">
							Entre com suas credenciais para acessar o sistema
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								{...register("email")}
								type="email"
								placeholder="Digite seu Email"
								required
								aria-invalid={hasEmailError}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Senha</Label>
							<Input
								{...register("password")}
								type="password"
								placeholder="Digite sua senha"
								required
								aria-invalid={hasPasswordError}
							/>
						</div>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Entrando..." : "Entrar"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
