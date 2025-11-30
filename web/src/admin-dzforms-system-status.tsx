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

const statusGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const statusCard = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 20px;
`;

const statusLabel = css`
  font-size: 14px;
  color: var(--gray500);
  margin-bottom: 8px;
`;

const statusValue = css`
  font-size: 24px;
  font-weight: 600;
  color: var(--white);
`;

const statusIndicator = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const statusGood = css`
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
`;

const statusDot = css`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
`;

const section = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const sectionTitle = css`
  font-size: 18px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray700);
`;

const infoRow = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray700);

  &:last-child {
    border-bottom: none;
  }
`;

const infoLabel = css`
  font-size: 14px;
  color: var(--gray400);
`;

const infoValue = css`
  font-size: 14px;
  color: var(--white);
  font-family: monospace;
`;

const checkItem = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray700);

  &:last-child {
    border-bottom: none;
  }
`;

const checkIcon = css`
  font-size: 18px;
`;

const checkLabel = css`
  font-size: 14px;
  color: var(--gray300);
  flex: 1;
`;

const checkStatus = css`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
`;

const checkPassed = css`
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
`;

const checkFailed = css`
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
`;

export const AdminDZFormsSystemStatus = () => {
	const systemInfo = {
		pluginVersion: "1.0.0",
		phpVersion: "N/A (Go Backend)",
		serverSoftware: "Go HTTP Server",
		databaseType: "SQLite",
		memoryLimit: "256 MB",
		maxUploadSize: "50 MB",
	};

	const healthChecks = [
		{ name: "Database Connection", passed: true },
		{ name: "File Permissions", passed: true },
		{ name: "SMTP Configuration", passed: false },
		{ name: "Cron Jobs", passed: true },
		{ name: "SSL Certificate", passed: true },
		{ name: "API Endpoints", passed: true },
	];

	return (
		<main class={mainContent}>
			<h1 class={title}>System Status</h1>
			<p class={subtitle}>Monitor the health of DragonByteForm</p>

			<div class={statusGrid}>
				<div class={statusCard}>
					<div class={statusLabel}>Overall Status</div>
					<div class={`${statusIndicator} ${statusGood}`}>
						<span class={statusDot} />
						Healthy
					</div>
				</div>
				<div class={statusCard}>
					<div class={statusLabel}>Active Forms</div>
					<div class={statusValue}>0</div>
				</div>
				<div class={statusCard}>
					<div class={statusLabel}>Total Entries</div>
					<div class={statusValue}>0</div>
				</div>
				<div class={statusCard}>
					<div class={statusLabel}>Storage Used</div>
					<div class={statusValue}>0 KB</div>
				</div>
			</div>

			<div class={section}>
				<h2 class={sectionTitle}>System Information</h2>
				<div class={infoRow}>
					<span class={infoLabel}>Plugin Version</span>
					<span class={infoValue}>{systemInfo.pluginVersion}</span>
				</div>
				<div class={infoRow}>
					<span class={infoLabel}>Backend</span>
					<span class={infoValue}>{systemInfo.phpVersion}</span>
				</div>
				<div class={infoRow}>
					<span class={infoLabel}>Server Software</span>
					<span class={infoValue}>{systemInfo.serverSoftware}</span>
				</div>
				<div class={infoRow}>
					<span class={infoLabel}>Database Type</span>
					<span class={infoValue}>{systemInfo.databaseType}</span>
				</div>
				<div class={infoRow}>
					<span class={infoLabel}>Memory Limit</span>
					<span class={infoValue}>{systemInfo.memoryLimit}</span>
				</div>
				<div class={infoRow}>
					<span class={infoLabel}>Max Upload Size</span>
					<span class={infoValue}>{systemInfo.maxUploadSize}</span>
				</div>
			</div>

			<div class={section}>
				<h2 class={sectionTitle}>Health Checks</h2>
				{healthChecks.map((check) => (
					<div class={checkItem}>
						<span class={checkIcon}>{check.passed ? "✅" : "❌"}</span>
						<span class={checkLabel}>{check.name}</span>
						<span class={`${checkStatus} ${check.passed ? checkPassed : checkFailed}`}>
							{check.passed ? "Passed" : "Failed"}
						</span>
					</div>
				))}
			</div>
		</main>
	);
};
