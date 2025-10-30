import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: async () => {
		const token = localStorage.getItem("access_token");

		if (!token) {
			throw redirect({
				to: "/auth/login",
			});
		}

		const role = localStorage.getItem("role");
		if (role !== "admin") {
			throw redirect({
				to: "/student/dashboard",
			});
		}
	},
});
