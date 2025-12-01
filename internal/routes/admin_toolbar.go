package routes

import (
	"strings"
)

// adminToolbarCSS contains the styles for the admin toolbar
const adminToolbarCSS = `
<style id="dz-admin-toolbar-styles">
#dz-admin-toolbar {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 32px;
	background: #1d2327;
	color: #f0f0f1;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
	font-size: 13px;
	z-index: 99999;
	display: flex;
	align-items: center;
	padding: 0 8px;
	box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

#dz-admin-toolbar a {
	color: #a7aaad;
	text-decoration: none;
	display: flex;
	align-items: center;
	padding: 0 8px;
	height: 32px;
	transition: color 0.15s ease;
}

#dz-admin-toolbar a:hover {
	color: #72aee6;
}

#dz-admin-toolbar .dz-toolbar-logo {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	background: #2271b1;
	margin-right: 4px;
}

#dz-admin-toolbar .dz-toolbar-logo:hover {
	background: #135e96;
}

#dz-admin-toolbar .dz-toolbar-logo svg {
	width: 20px;
	height: 20px;
	fill: #fff;
}

#dz-admin-toolbar .dz-toolbar-left {
	display: flex;
	align-items: center;
	flex: 1;
}

#dz-admin-toolbar .dz-toolbar-right {
	display: flex;
	align-items: center;
}

#dz-admin-toolbar .dz-toolbar-item {
	display: flex;
	align-items: center;
	gap: 4px;
}

#dz-admin-toolbar .dz-toolbar-item svg {
	width: 16px;
	height: 16px;
	fill: currentColor;
}

#dz-admin-toolbar .dz-toolbar-avatar {
	width: 16px;
	height: 16px;
	border-radius: 50%;
	margin-right: 4px;
}

#dz-admin-toolbar .dz-toolbar-separator {
	width: 1px;
	height: 16px;
	background: #3c4043;
	margin: 0 4px;
}

body.dz-admin-toolbar-active {
	margin-top: 32px !important;
}

@media (max-width: 600px) {
	#dz-admin-toolbar .dz-toolbar-item-text {
		display: none;
	}
}
</style>
`

// adminToolbarHTML contains the HTML structure for the admin toolbar
const adminToolbarHTML = `
<div id="dz-admin-toolbar">
	<div class="dz-toolbar-left">
		<a href="/_/admin" class="dz-toolbar-logo" title="Dashboard">
			<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
			</svg>
		</a>
		<a href="/_/admin" class="dz-toolbar-item" title="Dashboard">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="3" width="7" height="9"/>
				<rect x="14" y="3" width="7" height="5"/>
				<rect x="14" y="12" width="7" height="9"/>
				<rect x="3" y="16" width="7" height="5"/>
			</svg>
			<span class="dz-toolbar-item-text">Dashboard</span>
		</a>
		<div class="dz-toolbar-separator"></div>
		<a href="/_/admin/posts" class="dz-toolbar-item" title="New Post">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 5v14M5 12h14"/>
			</svg>
			<span class="dz-toolbar-item-text">New</span>
		</a>
	</div>
	<div class="dz-toolbar-right">
		<a href="/_/admin/user/profile" class="dz-toolbar-item dz-toolbar-user" title="Profile">
			<img class="dz-toolbar-avatar" id="dz-toolbar-avatar" src="" alt="">
			<span class="dz-toolbar-item-text" id="dz-toolbar-username">Howdy</span>
		</a>
	</div>
</div>
<script id="dz-admin-toolbar-script">
(function() {
	document.body.classList.add('dz-admin-toolbar-active');
	
	fetch('/api/me', { credentials: 'include' })
		.then(function(r) { return r.json(); })
		.then(function(data) {
			if (data.authenticated && data.user) {
				var avatar = document.getElementById('dz-toolbar-avatar');
				var username = document.getElementById('dz-toolbar-username');
				if (data.user.avatar_url) {
					avatar.src = data.user.avatar_url;
					avatar.style.display = 'block';
				} else {
					avatar.style.display = 'none';
				}
				username.textContent = 'Howdy, ' + (data.user.display_name || 'User');
			}
		})
		.catch(function(err) {
			console.error('Failed to load user info:', err);
		});
})();
</script>
`

// injectAdminToolbar injects the admin toolbar into HTML content
func injectAdminToolbar(content []byte) []byte {
	// Convert to string for manipulation
	html := string(content)

	// Find the closing </head> tag and inject CSS before it
	headClose := strings.Index(strings.ToLower(html), "</head>")
	if headClose > 0 {
		html = html[:headClose] + adminToolbarCSS + html[headClose:]
	} else {
		// No head tag, inject CSS at the beginning
		html = adminToolbarCSS + html
	}

	// Find the opening <body> tag and inject HTML after it
	bodyOpen := strings.Index(strings.ToLower(html), "<body")
	if bodyOpen >= 0 {
		// Find the closing > of the body tag
		bodyClose := strings.Index(html[bodyOpen:], ">")
		if bodyClose > 0 {
			insertPos := bodyOpen + bodyClose + 1
			html = html[:insertPos] + adminToolbarHTML + html[insertPos:]
		}
	} else {
		// No body tag, inject after head or at the end
		html = html + adminToolbarHTML
	}

	return []byte(html)
}
