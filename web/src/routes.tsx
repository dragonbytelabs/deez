import { Route, Router } from "@solidjs/router";
import { Admin } from "./Admin";
import { AdminOnboarding } from "./admin-onboarding";
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
const PHome = () => (<ProtectedRoute><Home /></ProtectedRoute>)
const PAdmin = () => (<ProtectedRoute><Admin/></ProtectedRoute>)
const PAdminTables = () => (<ProtectedRoute><AdminTables/></ProtectedRoute>)
const PAdminSettings = () => (<ProtectedRoute><AdminSettings/></ProtectedRoute>)
const PAdminProfile = () => (<ProtectedRoute><AdminUserProfile/></ProtectedRoute>)
const PAdminOnboarding = () => (<ProtectedRoute><AdminOnboarding/></ProtectedRoute>)
	return (
		<Router root={Layout}>
			<Route path="/" component={PHome} />
			<Route
				path="/_/admin"
				component={PAdmin}
			/>
			<Route
				path="/_/admin/tables"
				component={PAdminTables}
			/>
			<Route
				path="/_/admin/settings"
				component={PAdminSettings}
			/>
			<Route
				path="/_/admin/user/profile"
				component={PAdminProfile}
			/>
			<Route
				path="/_/admin/onboarding"
				component={PAdminOnboarding}
			/>
			<Route path="/login" component={() => <GuestRoute component={Login} />} />
			<Route
				path="/register"
				component={() => <GuestRoute component={Register} />}
			/>
		</Router>
	);
}
