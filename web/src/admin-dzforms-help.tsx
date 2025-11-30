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

const helpContainer = css`
  max-width: 900px;
`;

const searchContainer = css`
  margin-bottom: 30px;
`;

const searchInput = css`
  width: 100%;
  padding: 14px 20px;
  padding-left: 48px;
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  color: var(--white);
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
  }

  &::placeholder {
    color: var(--gray500);
  }
`;

const searchWrapper = css`
  position: relative;
`;

const searchIcon = css`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
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
  display: flex;
  align-items: center;
  gap: 12px;
`;

const sectionIcon = css`
  font-size: 24px;
`;

const faqItem = css`
  border-bottom: 1px solid var(--gray700);
  padding: 16px 0;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-of-type {
    padding-top: 0;
  }
`;

const faqQuestion = css`
  font-size: 15px;
  font-weight: 500;
  color: var(--white);
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: var(--primary);
  }
`;

const faqAnswer = css`
  font-size: 14px;
  color: var(--gray400);
  line-height: 1.6;
  padding-left: 24px;
`;

const linkGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const linkCard = css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--gray750);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;

  &:hover {
    background: var(--gray700);
  }
`;

const linkIcon = css`
  font-size: 24px;
`;

const linkText = css`
  font-size: 14px;
  color: var(--gray300);
`;

const contactSection = css`
  text-align: center;
  padding: 32px;
`;

const contactTitle = css`
  font-size: 18px;
  font-weight: 600;
  color: var(--white);
  margin-bottom: 8px;
`;

const contactDescription = css`
  font-size: 14px;
  color: var(--gray400);
  margin-bottom: 20px;
`;

const contactButton = css`
  padding: 12px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--primaryDark);
  }
`;

const faqs = [
	{
		question: "How do I create a new form?",
		answer:
			'Navigate to Forms > New Form from the sidebar. Enter a name and description for your form, then start adding fields using the form builder interface.',
	},
	{
		question: "Can I customize form notifications?",
		answer:
			"Yes! Go to Settings > Email Notifications to configure email templates, recipients, and notification triggers for each form.",
	},
	{
		question: "How do I export form entries?",
		answer:
			"Open the Entries page, select the form you want to export, then click the Export button. You can export in JSON or CSV format.",
	},
	{
		question: "Is there a limit to form submissions?",
		answer:
			"You can configure daily submission limits in Settings. By default, there's no limit, but you can set one to prevent spam.",
	},
	{
		question: "How do I add conditional logic to forms?",
		answer:
			"Install the Conditional Logic add-on from the Add-Ons page. Once installed, you can set up rules in the form builder to show/hide fields based on user input.",
	},
];

export const AdminDZFormsHelp = () => {
	return (
		<main class={mainContent}>
			<h1 class={title}>Help & Documentation</h1>
			<p class={subtitle}>Get help with DragonByteForm</p>

			<div class={helpContainer}>
				<div class={searchContainer}>
					<div class={searchWrapper}>
						<span class={searchIcon}>🔍</span>
						<input
							type="text"
							class={searchInput}
							placeholder="Search documentation..."
						/>
					</div>
				</div>

				<div class={section}>
					<h2 class={sectionTitle}>
						<span class={sectionIcon}>📚</span>
						Quick Links
					</h2>
					<div class={linkGrid}>
						<a href="#" class={linkCard}>
							<span class={linkIcon}>📖</span>
							<span class={linkText}>Getting Started Guide</span>
						</a>
						<a href="#" class={linkCard}>
							<span class={linkIcon}>🎥</span>
							<span class={linkText}>Video Tutorials</span>
						</a>
						<a href="#" class={linkCard}>
							<span class={linkIcon}>📋</span>
							<span class={linkText}>API Documentation</span>
						</a>
						<a href="#" class={linkCard}>
							<span class={linkIcon}>💡</span>
							<span class={linkText}>Tips & Tricks</span>
						</a>
					</div>
				</div>

				<div class={section}>
					<h2 class={sectionTitle}>
						<span class={sectionIcon}>❓</span>
						Frequently Asked Questions
					</h2>
					{faqs.map((faq) => (
						<div class={faqItem}>
							<div class={faqQuestion}>
								<span>▸</span>
								{faq.question}
							</div>
							<div class={faqAnswer}>{faq.answer}</div>
						</div>
					))}
				</div>

				<div class={section}>
					<div class={contactSection}>
						<h3 class={contactTitle}>Still need help?</h3>
						<p class={contactDescription}>
							Our support team is here to help you with any questions
						</p>
						<button class={contactButton}>Contact Support</button>
					</div>
				</div>
			</div>
		</main>
	);
};
