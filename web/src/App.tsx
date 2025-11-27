import { Route, Router } from "@solidjs/router";
import { Layout } from "./components/root-layout";
import { Login } from "./Login";
import { Home } from "./Home";
import { Admin } from "./admin";
import { AdminTables } from "./admin-tables";
import { Register } from "./Register";
import { GuestRoute } from "./components/guest-route";
import { ProtectedRoute } from "./components/protected-route";

export default function App() {
	return (
		<Router root={Layout}>
			<Route path="/" component={() => <ProtectedRoute component={Home} />} />
			<Route path="/_/admin" component={() => <ProtectedRoute component={Admin} />} />
			<Route path="/_/admin/tables" component={() => <ProtectedRoute component={AdminTables} />} />
			<Route path="/login" component={() => <GuestRoute component={Login} />} />
			<Route path="/register" component={() => <GuestRoute component={Register} />} />
		</Router>
	);
}
