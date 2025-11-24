import type { ParentProps } from "solid-js";
import { css } from "@linaria/core";

const layout = css`
  :global() {
  :root {
    --bg: #09090b;
    --primary: #cd80ed;
    --primaryDark: #b368d8;
    --accent: #8874d3;
    --gray500: #71717a;
    --gray600: #52525b;
    --gray700: #3f3f46;
    --gray800: #27272a;
    --yellow400: #facc15;
    --white: #f4f4f5;
  }
  *, 
  *::before, 
  *::after { 
    box-sizing: border-box; 
    margin:0; 
    padding:0; 
  }
  html, body, #root { 
    min-height:100%; 
    font-family:Inter,system-ui,sans-serif; 
    background:var(--bg);
    color: var(--white);
  }
  img {
    max-width:100%; 
    height:auto; 
    display:block;
  }
}`;

export const Layout = (props: ParentProps) => {
	return <div class={layout}>{props.children}</div>;
};
