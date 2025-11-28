import { Route, Router } from "@solidjs/router";
import { Admin } from "./admin";
import { AdminSettings } from "./admin-settings";
import { AdminTables } from "./admin-tables";
import { AdminUserProfile } from "./admin-user-profile";
import { GuestRoute } from "./components/guest-route";
import { ProtectedRoute } from "./components/protected-route";
import { Layout } from "./components/root-layout";
import { Home } from "./Home";
import { Login } from "./Login";
import { Register } from "./Register";

export const Routes = () => {
	return (
		<Router root={Layout}>
			<Route path="/" component={() => <ProtectedRoute component={Home} />} />
			<Route
				path="/_/admin"
				component={() => <ProtectedRoute component={Admin} />}
			/>
			<Route
				path="/_/admin/tables"
				component={() => <ProtectedRoute component={AdminTables} />}
			/>
			<Route
				path="/_/admin/settings"
				component={() => <ProtectedRoute component={AdminSettings} />}
			/>
			<Route
				path="/_/admin/user/profile"
				component={() => <ProtectedRoute component={AdminUserProfile} />}
			/>
			<Route path="/login" component={() => <GuestRoute component={Login} />} />
			<Route
				path="/register"
				component={() => <GuestRoute component={Register} />}
			/>
		</Router>
	);
}
