import { Route, Router } from "@solidjs/router";
import { Admin } from "./Admin";
import { AdminAppearance } from "./admin-appearance";
import { AdminDZForms } from "./admin-dzforms";
import { AdminDZFormsNew } from "./admin-dzforms-new";
import { AdminDZFormsEntries } from "./admin-dzforms-entries";
import { AdminDZFormsSettings } from "./admin-dzforms-settings";
import { AdminDZFormsImportExport } from "./admin-dzforms-import-export";
import { AdminDZFormsAddons } from "./admin-dzforms-addons";
import { AdminDZFormsSystemStatus } from "./admin-dzforms-system-status";
import { AdminDZFormsHelp } from "./admin-dzforms-help";
import { AdminMedia } from "./admin-media";
import { AdminOnboarding } from "./admin-onboarding";
import { AdminPlugins } from "./admin-plugins";
import { AdminSettings } from "./admin-settings";
import { AdminTables } from "./admin-tables";
import { AdminThemes } from "./admin-themes";
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
const PAdminMedia = () => (<ProtectedRoute><AdminMedia/></ProtectedRoute>)
const PAdminAppearance = () => (<ProtectedRoute><AdminAppearance/></ProtectedRoute>)
const PAdminSettings = () => (<ProtectedRoute><AdminSettings/></ProtectedRoute>)
const PAdminPlugins = () => (<ProtectedRoute><AdminPlugins/></ProtectedRoute>)
const PAdminDZForms = () => (<ProtectedRoute><AdminDZForms/></ProtectedRoute>)
const PAdminDZFormsNew = () => (<ProtectedRoute><AdminDZFormsNew/></ProtectedRoute>)
const PAdminDZFormsEntries = () => (<ProtectedRoute><AdminDZFormsEntries/></ProtectedRoute>)
const PAdminDZFormsSettings = () => (<ProtectedRoute><AdminDZFormsSettings/></ProtectedRoute>)
const PAdminDZFormsImportExport = () => (<ProtectedRoute><AdminDZFormsImportExport/></ProtectedRoute>)
const PAdminDZFormsAddons = () => (<ProtectedRoute><AdminDZFormsAddons/></ProtectedRoute>)
const PAdminDZFormsSystemStatus = () => (<ProtectedRoute><AdminDZFormsSystemStatus/></ProtectedRoute>)
const PAdminDZFormsHelp = () => (<ProtectedRoute><AdminDZFormsHelp/></ProtectedRoute>)
const PAdminThemes = () => (<ProtectedRoute><AdminThemes/></ProtectedRoute>)
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
				path="/_/admin/media"
				component={PAdminMedia}
			/>
			<Route
				path="/_/admin/appearance"
				component={PAdminAppearance}
			/>
			<Route
				path="/_/admin/themes"
				component={PAdminThemes}
			/>
			<Route
				path="/_/admin/settings"
				component={PAdminSettings}
			/>
			<Route
				path="/_/admin/plugins"
				component={PAdminPlugins}
			/>
			<Route
				path="/_/admin/plugins/dzforms"
				component={PAdminDZForms}
			/>
			<Route
				path="/_/admin/plugins/dzforms/new"
				component={PAdminDZFormsNew}
			/>
			<Route
				path="/_/admin/plugins/dzforms/entries"
				component={PAdminDZFormsEntries}
			/>
			<Route
				path="/_/admin/plugins/dzforms/settings"
				component={PAdminDZFormsSettings}
			/>
			<Route
				path="/_/admin/plugins/dzforms/import-export"
				component={PAdminDZFormsImportExport}
			/>
			<Route
				path="/_/admin/plugins/dzforms/addons"
				component={PAdminDZFormsAddons}
			/>
			<Route
				path="/_/admin/plugins/dzforms/system-status"
				component={PAdminDZFormsSystemStatus}
			/>
			<Route
				path="/_/admin/plugins/dzforms/help"
				component={PAdminDZFormsHelp}
			/>
			<Route
				path="/_/admin/user/profile"
				component={PAdminProfile}
			/>
			<Route
				path="/_/admin/onboarding"
				component={PAdminOnboarding}
			/>
			<Route path="/_/admin/login" component={() => <GuestRoute component={Login} />} />
			<Route
				path="/_/admin/register"
				component={() => <GuestRoute component={Register} />}
			/>
		</Router>
	);
}
