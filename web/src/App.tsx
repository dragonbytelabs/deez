import { Route, Router } from "@solidjs/router";
import { Admin } from "./Admin";
import { AdminSettings } from "./admin-settings";
import { AdminTables } from "./admin-tables";
import { GuestRoute } from "./components/guest-route";
import { ProtectedRoute } from "./components/protected-route";
import { Layout } from "./components/root-layout";
import { Home } from "./Home";
import { Login } from "./Login";
import { Register } from "./Register";

export default function App() {
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
			<Route path="/login" component={() => <GuestRoute component={Login} />} />
			<Route
				path="/register"
				component={() => <GuestRoute component={Register} />}
			/>
		</Router>
	);
}
