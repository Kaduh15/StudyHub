import type { QueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import z from "zod";
import { getIsAdmin } from "@/api/admin/get-is-admin";
import { AdminSidebar } from "@/components/admin-sidebar";

const getValidatedToken = () => {
	const token = localStorage.getItem("access_token");

	if (!token || !z.jwt().safeParse(token).success) {
		throw redirect({ to: "/auth/login" });
	}

	return token;
};

const ensureAdmin = async (queryClient: QueryClient, token: string) => {
	const { is_admin } = await queryClient.fetchQuery({
		queryFn: () => getIsAdmin(),
		queryKey: ["isAdmin", token],
	});

	if (!is_admin) {
		throw redirect({ to: "/student/dashboard" });
	}
};

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const { queryClient } = context;
		const token = getValidatedToken();

		await ensureAdmin(queryClient, token);
	},
});

function RouteComponent() {
	return (
		<div className="flex min-h-screen w-full bg-background">
			<AdminSidebar />
			<Outlet />
		</div>
	);
}
