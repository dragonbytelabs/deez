import { css } from "@linaria/core";
import { createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { api } from "./server/api";

const mainContent = css`
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const header = css`
  margin-bottom: 40px;
`;

const title = css`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--white);
`;

const subtitle = css`
  font-size: 16px;
  color: var(--gray500);
  max-width: 600px;
`;

const templatesGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const templateCard = css`
  background: var(--gray800);
  border: 1px solid var(--gray700);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:hover .hover-overlay {
    opacity: 1;
  }
`;

const templatePreview = css`
  height: 200px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const blankFormPreview = css`
  background: var(--gray700);
  border: 2px dashed var(--gray600);
  border-radius: 8px;
  width: calc(100% - 32px);
  height: calc(100% - 32px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px;
`;

const blankFormIcon = css`
  width: 48px;
  height: 48px;
  border: 2px solid var(--gray500);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray500);
  font-size: 24px;
`;

const previewMockup = css`
  background: white;
  border-radius: 8px;
  padding: 16px;
  width: calc(100% - 32px);
  height: calc(100% - 32px);
  margin: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const mockupIcon = css`
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
`;

const mockupField = css`
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-top: 36px;
`;

const mockupFieldSmall = css`
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  width: 60%;
`;

const mockupFieldMedium = css`
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  width: 80%;
`;

const mockupButton = css`
  height: 12px;
  background: var(--primary);
  border-radius: 4px;
  width: 40%;
  margin-top: auto;
`;

const hoverOverlay = css`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.2s;
`;

const useTemplateButton = css`
  padding: 10px 20px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--primaryDark);
  }
`;

const previewButton = css`
  padding: 10px 20px;
  background: white;
  color: var(--gray800);
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;

  &:hover {
    background: var(--gray200);
  }
`;

const templateName = css`
  padding: 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--white);
`;

const loadingText = css`
  color: var(--gray500);
  font-size: 16px;
  text-align: center;
  padding: 40px;
`;

const errorText = css`
  color: #ef4444;
  font-size: 16px;
  text-align: center;
  padding: 40px;
`;

// Template data with different form types
const formTemplates = [
	{
		id: "blank",
		name: "Blank Form",
		icon: "+",
		bgColor: "#f5f5f5",
		iconColor: "#666",
		fields: [],
	},
	{
		id: "advanced-contact",
		name: "Advanced Contact Form",
		icon: "📋",
		bgColor: "#e8f4fc",
		iconColor: "#4a90d9",
		fields: ["name", "email", "phone", "message"],
	},
	{
		id: "simple-contact",
		name: "Simple Contact Form",
		icon: "📋",
		bgColor: "#fff8e6",
		iconColor: "#d4a853",
		fields: ["name", "email", "message"],
	},
	{
		id: "contest-entry",
		name: "Contest Entry Form",
		icon: "🏆",
		bgColor: "#e8f8e8",
		iconColor: "#4caf50",
		fields: ["name", "email", "entry"],
	},
	{
		id: "donation",
		name: "Donation Form",
		icon: "❤️",
		bgColor: "#fce8e8",
		iconColor: "#e57373",
		fields: ["name", "amount", "message"],
	},
	{
		id: "ecommerce",
		name: "eCommerce Form",
		icon: "🛒",
		bgColor: "#e8f4fc",
		iconColor: "#4a90d9",
		fields: ["product", "quantity", "shipping"],
	},
	{
		id: "stripe-checkout",
		name: "Stripe Checkout Form",
		icon: "💳",
		bgColor: "#e0f7f7",
		iconColor: "#26a69a",
		fields: ["amount", "card", "billing"],
	},
	{
		id: "paypal-checkout",
		name: "PayPal Checkout Form",
		icon: "💰",
		bgColor: "#e8f8e8",
		iconColor: "#4caf50",
		fields: ["amount", "paypal", "notes"],
	},
	{
		id: "order",
		name: "Order Form",
		icon: "📦",
		bgColor: "#fff8e6",
		iconColor: "#d4a853",
		fields: ["items", "quantity", "address"],
	},
	{
		id: "event-registration",
		name: "Event Registration Form",
		icon: "📅",
		bgColor: "#e8f4fc",
		iconColor: "#4a90d9",
		fields: ["name", "email", "event", "guests"],
	},
	{
		id: "survey",
		name: "Survey Form",
		icon: "📊",
		bgColor: "#fff8e6",
		iconColor: "#d4a853",
		fields: ["question1", "question2", "question3"],
	},
	{
		id: "job-application",
		name: "Job Application Form",
		icon: "💼",
		bgColor: "#e8f8e8",
		iconColor: "#4caf50",
		fields: ["name", "resume", "experience"],
	},
];

export const AdminDZFormsTemplates = () => {
	const navigate = useNavigate();
	const [creating, setCreating] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	const createFormFromTemplate = async (template: (typeof formTemplates)[0]) => {
		setCreating(true);
		setError(null);

		try {
			const fields = JSON.stringify(template.fields);
			const response = await api.createForm(template.name, `Created from ${template.name} template`, fields);

			if (response.ok) {
				const data = await response.json();
				navigate(`/_/admin/plugins/dzforms/edit/${data.form.id}`);
			} else {
				setError("Failed to create form");
			}
		} catch (err) {
			setError("Failed to create form");
		} finally {
			setCreating(false);
		}
	};

	const handlePreview = (e: Event, _templateId: string) => {
		e.stopPropagation();
		// Preview functionality to be implemented in future iteration
	};

	const handleUseTemplate = (e: Event, template: (typeof formTemplates)[0]) => {
		e.stopPropagation();
		createFormFromTemplate(template);
	};

	return (
		<main class={mainContent}>
			<div class={header}>
				<h1 class={title}>Explore Form Templates</h1>
				<p class={subtitle}>
					Quickly create an amazing form by using a pre-made template, or start from scratch to tailor your form to your specific needs.
				</p>
			</div>

			<Show when={error()}>
				<p class={errorText}>{error()}</p>
			</Show>

			<Show when={creating()}>
				<p class={loadingText}>Creating form...</p>
			</Show>

			<div class={templatesGrid}>
				<For each={formTemplates}>
					{(template) => (
						<div class={templateCard} onClick={() => createFormFromTemplate(template)}>
							<div class={templatePreview} style={{ background: template.bgColor }}>
								<Show when={template.id === "blank"}>
									<div class={blankFormPreview}>
										<div class={blankFormIcon}>+</div>
									</div>
								</Show>
								<Show when={template.id !== "blank"}>
									<div class={previewMockup}>
										<span class={mockupIcon}>{template.icon}</span>
										<div class={mockupField} />
										<div class={mockupFieldMedium} />
										<div class={mockupFieldSmall} />
										<div class={mockupFieldMedium} />
										<div class={mockupButton} />
									</div>
									<div class={`${hoverOverlay} hover-overlay`}>
										<button
											class={useTemplateButton}
											onClick={(e) => handleUseTemplate(e, template)}
											disabled={creating()}
										>
											Use Template
										</button>
										<button
											class={previewButton}
											onClick={(e) => handlePreview(e, template.id)}
										>
											<span>↗</span> Preview
										</button>
									</div>
								</Show>
							</div>
							<div class={templateName}>{template.name}</div>
						</div>
					)}
				</For>
			</div>
		</main>
	);
};
