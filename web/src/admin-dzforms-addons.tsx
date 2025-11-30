import { css } from "@linaria/core";

const mainContent = css`
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const title = css`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--white);
`;

const subtitle = css`
  font-size: 18px;
  color: var(--gray500);
  margin-bottom: 30px;
`;

const addonsGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const addonCard = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--gray600);
  }
`;

const addonHeader = css`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const addonIcon = css`
  font-size: 32px;
`;

const addonInfo = css`
  flex: 1;
`;

const addonName = css`
  font-size: 16px;
  font-weight: 600;
  color: var(--white);
`;

const addonVersion = css`
  font-size: 12px;
  color: var(--gray500);
`;

const addonDescription = css`
  font-size: 14px;
  color: var(--gray400);
  margin-bottom: 16px;
  line-height: 1.5;
`;

const addonStatus = css`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const statusAvailable = css`
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
`;

const statusInstalled = css`
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
`;

const statusPremium = css`
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
`;

const addonActions = css`
  margin-top: 16px;
  display: flex;
  gap: 8px;
`;

const installButton = css`
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--primaryDark);
  }
`;

const viewButton = css`
  padding: 8px 16px;
  background: transparent;
  color: var(--gray400);
  border: 1px solid var(--gray600);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--gray500);
    color: var(--gray300);
  }
`;

const addons = [
	{
		name: "File Upload",
		icon: "📎",
		version: "1.0.0",
		description: "Allow users to upload files through your forms",
		status: "available",
	},
	{
		name: "Conditional Logic",
		icon: "🔀",
		version: "1.2.0",
		description: "Show or hide fields based on user input",
		status: "installed",
	},
	{
		name: "Payment Integration",
		icon: "💳",
		version: "2.0.0",
		description: "Accept payments through Stripe or PayPal",
		status: "premium",
	},
	{
		name: "Email Templates",
		icon: "✉️",
		version: "1.1.0",
		description: "Customize email notifications with templates",
		status: "available",
	},
	{
		name: "Multi-page Forms",
		icon: "📑",
		version: "1.0.5",
		description: "Split long forms into multiple pages",
		status: "available",
	},
	{
		name: "Analytics Dashboard",
		icon: "📊",
		version: "1.3.0",
		description: "Track form submissions and conversion rates",
		status: "premium",
	},
];

export const AdminDZFormsAddons = () => {
	const getStatusClass = (status: string) => {
		switch (status) {
			case "installed":
				return statusInstalled;
			case "premium":
				return statusPremium;
			default:
				return statusAvailable;
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "installed":
				return "Installed";
			case "premium":
				return "Premium";
			default:
				return "Available";
		}
	};

	return (
		<main class={mainContent}>
			<h1 class={title}>Add-Ons</h1>
			<p class={subtitle}>Extend the functionality of DragonByteForm</p>

			<div class={addonsGrid}>
				{addons.map((addon) => (
					<div class={addonCard}>
						<div class={addonHeader}>
							<span class={addonIcon}>{addon.icon}</span>
							<div class={addonInfo}>
								<div class={addonName}>{addon.name}</div>
								<div class={addonVersion}>v{addon.version}</div>
							</div>
							<span class={`${addonStatus} ${getStatusClass(addon.status)}`}>
								{getStatusText(addon.status)}
							</span>
						</div>
						<p class={addonDescription}>{addon.description}</p>
						<div class={addonActions}>
							{addon.status === "installed" ? (
								<button class={viewButton}>Configure</button>
							) : addon.status === "premium" ? (
								<button class={installButton}>Upgrade</button>
							) : (
								<button class={installButton}>Install</button>
							)}
							<button class={viewButton}>Learn More</button>
						</div>
					</div>
				))}
			</div>
		</main>
	);
};
