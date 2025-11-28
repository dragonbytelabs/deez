import { DzProvider } from "./dz-context";
import { Routes } from "./routes";

export default function App() {
	return (
		<DzProvider>
			<Routes />
		</DzProvider>
	);
}
