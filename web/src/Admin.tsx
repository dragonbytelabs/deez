import { css } from "@linaria/core";
import { api } from "./server/api";

const content = css`
  background-color: #red;
`;

const menu = css`
  display: flex;
  justify-content: space-between;
  width: 300px;
  font-size: 20px;
`;

export const Admin = () => {
	const logout = async () => {
		try {
			const response = await api.logout();

			if (response.ok) {
				const data = await response.json();
				console.log("Logout successful:", data);
				if (data.redirect) {
					window.location.href = data.redirect;
				} else {
					// Fallback if no redirect provided
					window.location.href = "/login";
				}
			} else {
				const error = await response.text();
				console.error("Logout failed:", error);
				alert("Failed to logout. Please try again.");
			}
		} catch (error) {
			console.error("Logout error:", error);
			alert("Network error during logout.");
		}
	};
	return (
		<div class={content}>
			<h1>Admin</h1>
			<div class={menu}>
				<button onClick={logout}>Logout</button>
			</div>
			<p>This is the admin page</p>
			<p>This is the admin page</p>
			<p>This is the admin page</p>
			<p>This is the admin page</p>
		</div>
	);
};
