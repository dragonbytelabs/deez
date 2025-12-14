import { Route, Router } from "@solidjs/router";
import { Layout } from "./components/root-layout";
import { Home } from "./Home";

export const Routes = () => {
	return (
		<Router root={Layout}>
			<Route path="/" component={() => (<Home />)} />
		</Router>
	);
}
