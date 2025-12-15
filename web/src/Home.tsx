import { css } from "@linaria/core";
import { createResource } from "solid-js";
import { api } from "./server/api";

const content = css`
  background-color: #red;
`;

export const Home = () => {
	const [data] = createResource(api.getInfo);

	return (
		<div class={content}>
			<p>This is the homepage</p>
			<p>This is the homepage</p>
			{data() && <pre>{JSON.stringify(data(), null, 2)}</pre>}
		</div>
	);
};
