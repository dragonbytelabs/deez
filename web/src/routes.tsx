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
import { AdminPosts } from "./admin-posts";
import { AdminPostsEdit } from "./admin-posts-edit";
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
	return (
		<Router root={Layout}>
			<Route path="/" component={() => (<GuestRoute><Home /></GuestRoute>)} />
			<Route
				path="/_/admin"
				component={() => (<ProtectedRoute><Admin/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/tables"
				component={() => (<ProtectedRoute><AdminTables/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/media"
				component={() => (<ProtectedRoute><AdminMedia/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/posts"
				component={() => (<ProtectedRoute><AdminPosts/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/posts/:id"
				component={() => (<ProtectedRoute><AdminPostsEdit/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/appearance"
				component={() => (<ProtectedRoute><AdminAppearance/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/themes"
				component={() => (<ProtectedRoute><AdminThemes/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/settings"
				component={() => (<ProtectedRoute><AdminSettings/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/plugins"
				component={() => (<ProtectedRoute><AdminPlugins/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/plugins/dzforms"
				component={() => (<ProtectedRoute><AdminDZForms/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/plugins/dzforms/new"
				component={() => (<ProtectedRoute><AdminDZFormsNew/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/plugins/dzforms/entries"
				component={() => (<ProtectedRoute><AdminDZFormsEntries/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/plugins/dzforms/settings"
				component={() => (<ProtectedRoute><AdminDZFormsSettings/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/plugins/dzforms/import-export"
				component={() => (<ProtectedRoute><AdminDZFormsImportExport/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/plugins/dzforms/addons"
				component={() => (<ProtectedRoute><AdminDZFormsAddons/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/plugins/dzforms/system-status"
				component={() => (<ProtectedRoute><AdminDZFormsSystemStatus/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/plugins/dzforms/help"
				component={() => (<ProtectedRoute><AdminDZFormsHelp/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/user/profile"
				component={() => (<ProtectedRoute><AdminUserProfile/></ProtectedRoute>)}
			/>
			<Route
				path="/_/admin/onboarding"

				component ={ () => (<ProtectedRoute><AdminOnboarding/></ProtectedRoute>)}
			/>
			<Route path="/_/admin/login" component={() => <GuestRoute><Login /></GuestRoute>} />
			<Route
				path="/_/admin/register" component={() => <GuestRoute><Register /></GuestRoute>} />
		</Router>
	);
}
