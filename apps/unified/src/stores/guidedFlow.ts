import { create } from 'zustand';

export interface FlowStep {
  id: string;
  type: 'question' | 'action' | 'result';
  title: string;
  description?: string;
  content: string;
  options?: FlowOption[];
  nextStep?: string;
  metadata?: Record<string, any>;
}

export interface FlowOption {
  id: string;
  label: string;
  description?: string;
  nextStep: string;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface GuidedFlow {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  tags: string[];
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'complex';
  steps: FlowStep[];
  popularity: number;
  lastUpdated: string;
  createdBy: string;
}

export interface FlowSession {
  flowId: string;
  currentStepId: string;
  answers: Record<string, any>;
  startedAt: string;
  lastUpdatedAt: string;
  metadata?: Record<string, any>;
}

interface GuidedFlowState {
  flows: GuidedFlow[];
  activeSession: FlowSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadFlows: () => Promise<void>;
  getFlow: (id: string) => GuidedFlow | undefined;
  startFlow: (flowId: string) => void;
  nextStep: (stepId: string, answer?: any) => void;
  previousStep: () => void;
  completeFlow: () => void;
  resetFlow: () => void;
  updateAnswer: (stepId: string, answer: any) => void;
}

export const useGuidedFlowStore = create<GuidedFlowState>((set, get) => ({
  flows: [],
  activeSession: null,
  isLoading: false,
  error: null,

  loadFlows: async () => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API call - in production, this would be a real API endpoint
      const mockFlows: GuidedFlow[] = [
        {
          id: 'software-installation',
          title: 'Software Installation Help',
          description:
            'Get step-by-step guidance for installing and configuring software on your device',
          category: 'Software Support',
          icon: '💻',
          tags: ['software', 'installation', 'setup'],
          estimatedTime: 5,
          difficulty: 'easy',
          popularity: 85,
          lastUpdated: new Date().toISOString(),
          createdBy: 'System',
          steps: [
            {
              id: 'device-type',
              type: 'question',
              title: 'What type of device are you using?',
              content:
                'To provide the most accurate installation instructions, please select your device type.',
              options: [
                {
                  id: 'windows',
                  label: 'Windows PC',
                  description: 'Windows 10 or Windows 11',
                  nextStep: 'software-type-windows',
                  icon: '🪟',
                },
                {
                  id: 'mac',
                  label: 'Mac',
                  description: 'macOS or Mac OS X',
                  nextStep: 'software-type-mac',
                  icon: '🍎',
                },
                {
                  id: 'mobile',
                  label: 'Mobile Device',
                  description: 'iPhone, iPad, or Android',
                  nextStep: 'mobile-app-store',
                  icon: '📱',
                },
              ],
            },
            {
              id: 'software-type-windows',
              type: 'question',
              title: 'What software do you need to install?',
              content: 'Select the type of software you need help installing on Windows.',
              options: [
                {
                  id: 'office',
                  label: 'Microsoft Office',
                  description: 'Word, Excel, PowerPoint, Outlook',
                  nextStep: 'office-windows-steps',
                  icon: '📊',
                },
                {
                  id: 'adobe',
                  label: 'Adobe Creative Suite',
                  description: 'Photoshop, Illustrator, Acrobat',
                  nextStep: 'adobe-windows-steps',
                  icon: '🎨',
                },
                {
                  id: 'browser',
                  label: 'Web Browser',
                  description: 'Chrome, Firefox, Edge',
                  nextStep: 'browser-windows-steps',
                  icon: '🌐',
                },
                {
                  id: 'other',
                  label: 'Other Software',
                  description: 'Custom or specialized software',
                  nextStep: 'general-windows-steps',
                  icon: '⚙️',
                },
              ],
            },
            {
              id: 'office-windows-steps',
              type: 'result',
              title: 'Installing Microsoft Office on Windows',
              content: `
**Step-by-step instructions:**

1. **Download Office**
   - Go to office.com and sign in with your company email
   - Click "Install Office" then "Office 365 apps"

2. **Run the installer**
   - Open the downloaded file (OfficeSetup.exe)
   - Click "Yes" when prompted by Windows security

3. **Wait for installation**
   - The installer will download and install automatically
   - This may take 10-30 minutes depending on your internet speed

4. **Launch and activate**
   - Open any Office app (Word, Excel, etc.)
   - Sign in with your company credentials
   - Office will activate automatically

**Need help?** If you encounter any issues, please create a support ticket and include:
- Your device model and Windows version
- The exact error message (if any)
- A screenshot of the problem

**Estimated completion time:** 15-45 minutes
              `,
              nextStep: 'create-ticket',
            },
            {
              id: 'create-ticket',
              type: 'action',
              title: 'Need Additional Help?',
              content:
                "If these instructions didn't resolve your issue, you can create a support ticket for personalized assistance.",
              options: [
                {
                  id: 'create-ticket',
                  label: 'Create Support Ticket',
                  description: 'Get help from our technical team',
                  nextStep: 'ticket-form',
                  icon: '🎫',
                },
                {
                  id: 'try-again',
                  label: 'Try Different Software',
                  description: 'Get help with different software installation',
                  nextStep: 'device-type',
                  icon: '🔄',
                },
                {
                  id: 'completed',
                  label: 'Problem Resolved',
                  description: 'Mark this request as completed',
                  nextStep: 'completion',
                  icon: '✅',
                },
              ],
            },
          ],
        },
        {
          id: 'benefits-guide',
          title: 'Understanding Your Benefits',
          description:
            'Get personalized information about your employee benefits and coverage options',
          category: 'HR Support',
          icon: '🏥',
          tags: ['benefits', 'healthcare', 'hr'],
          estimatedTime: 8,
          difficulty: 'medium',
          popularity: 92,
          lastUpdated: new Date().toISOString(),
          createdBy: 'HR Team',
          steps: [
            {
              id: 'employee-type',
              type: 'question',
              title: 'What is your employment status?',
              content:
                'Your benefits may vary based on your employment type. Please select the option that best describes your current status.',
              options: [
                {
                  id: 'full-time',
                  label: 'Full-time Employee',
                  description: '40+ hours per week, permanent position',
                  nextStep: 'benefit-category-full',
                  icon: '💼',
                },
                {
                  id: 'part-time',
                  label: 'Part-time Employee',
                  description: 'Less than 40 hours per week',
                  nextStep: 'benefit-category-part',
                  icon: '⏰',
                },
                {
                  id: 'contractor',
                  label: 'Contractor/Consultant',
                  description: 'Independent contractor or consultant',
                  nextStep: 'contractor-benefits',
                  icon: '🤝',
                },
                {
                  id: 'intern',
                  label: 'Intern',
                  description: 'Student intern or temporary worker',
                  nextStep: 'intern-benefits',
                  icon: '🎓',
                },
              ],
            },
            {
              id: 'benefit-category-full',
              type: 'question',
              title: 'Which benefits would you like to learn about?',
              content:
                "As a full-time employee, you have access to our comprehensive benefits package. Select the area you'd like to explore.",
              options: [
                {
                  id: 'health-insurance',
                  label: 'Health Insurance',
                  description: 'Medical, dental, and vision coverage',
                  nextStep: 'health-details-full',
                  icon: '🏥',
                },
                {
                  id: 'retirement',
                  label: 'Retirement Planning',
                  description: '401(k), matching, and investment options',
                  nextStep: 'retirement-details',
                  icon: '💰',
                },
                {
                  id: 'pto',
                  label: 'Time Off',
                  description: 'Vacation, sick leave, and personal days',
                  nextStep: 'pto-details',
                  icon: '🏖️',
                },
                {
                  id: 'wellness',
                  label: 'Wellness Programs',
                  description: 'Gym memberships, mental health resources',
                  nextStep: 'wellness-details',
                  icon: '💪',
                },
              ],
            },
            {
              id: 'health-details-full',
              type: 'result',
              title: 'Your Health Insurance Benefits',
              content: `
**Full-time Employee Health Benefits**

**Medical Insurance:**
- **Plan Options:** Basic PPO, Premium PPO, High-Deductible Health Plan (HDHP)
- **Company Contribution:** 80% of premium costs
- **Annual Deductible:** $1,000 (Basic) to $3,000 (HDHP)
- **Out-of-pocket Maximum:** $5,000 individual / $10,000 family

**Dental Insurance:**
- **Coverage:** Preventive care 100%, Basic 80%, Major 50%
- **Annual Maximum:** $2,000 per person
- **Orthodontics:** 50% coverage up to $2,000 lifetime

**Vision Insurance:**
- **Eye Exams:** Covered annually
- **Frames/Lenses:** $200 allowance every 2 years
- **Contact Lenses:** $150 allowance annually

**Health Savings Account (HSA):**
- Available with HDHP
- Company contributes $1,000 annually
- Triple tax advantage (deductible, growth, withdrawals)

**Open Enrollment:** November 1-15 annually

**Questions?** Contact HR at benefits@company.com or extension 1234
              `,
              nextStep: 'more-benefits',
            },
          ],
        },
        {
          id: 'password-reset',
          title: 'Password Reset & Security',
          description: 'Reset your password and learn about security best practices',
          category: 'IT Security',
          icon: '🔐',
          tags: ['password', 'security', 'account'],
          estimatedTime: 3,
          difficulty: 'easy',
          popularity: 78,
          lastUpdated: new Date().toISOString(),
          createdBy: 'Security Team',
          steps: [
            {
              id: 'account-type',
              type: 'question',
              title: 'Which account needs a password reset?',
              content: 'Select the type of account you need to reset the password for.',
              options: [
                {
                  id: 'company-email',
                  label: 'Company Email Account',
                  description: 'Your primary work email (@company.com)',
                  nextStep: 'email-reset-steps',
                  icon: '📧',
                },
                {
                  id: 'vpn-account',
                  label: 'VPN Account',
                  description: 'Remote access to company network',
                  nextStep: 'vpn-reset-steps',
                  icon: '🔒',
                },
                {
                  id: 'application',
                  label: 'Business Application',
                  description: 'CRM, ERP, or other work applications',
                  nextStep: 'app-reset-options',
                  icon: '💼',
                },
                {
                  id: 'security-help',
                  label: 'Security Best Practices',
                  description: 'Learn about password security',
                  nextStep: 'security-guide',
                  icon: '🛡️',
                },
              ],
            },
            {
              id: 'email-reset-steps',
              type: 'result',
              title: 'Resetting Your Email Password',
              content: `
**Self-Service Password Reset:**

1. **Go to the password reset portal**
   - Visit: portal.company.com/password-reset
   - Or use the "Forgot Password" link on any login page

2. **Enter your information**
   - Username: Your email address
   - Secondary verification: Phone number or security questions

3. **Check your phone/email**
   - You'll receive a verification code
   - Enter the code on the reset page

4. **Create a new password**
   - Must be at least 12 characters
   - Include: uppercase, lowercase, numbers, and symbols
   - Cannot reuse your last 12 passwords

**Password Requirements:**
- ✅ Minimum 12 characters
- ✅ At least 1 uppercase letter (A-Z)
- ✅ At least 1 lowercase letter (a-z)
- ✅ At least 1 number (0-9)
- ✅ At least 1 special character (!@#$%^&*)
- ❌ No common words or patterns
- ❌ No personal information (name, birthday, etc.)

**Still having trouble?** Contact IT Support at ext. 4357 or submit a ticket.
              `,
              nextStep: 'setup-2fa',
            },
            {
              id: 'security-guide',
              type: 'result',
              title: 'Password Security Best Practices',
              content: `
**Creating Strong Passwords:**

**Use a Passphrase Method:**
- Example: "Coffee!Morning@Sunrise2024"
- Combine 3-4 unrelated words with numbers and symbols
- Easier to remember than random characters

**Password Manager Recommended:**
- Company provides: LastPass Business
- Generates and stores complex passwords
- Only need to remember one master password
- Available on all devices

**Multi-Factor Authentication (MFA):**
- Required for all company accounts
- Use Microsoft Authenticator app
- Backup codes stored securely
- Adds extra security layer

**What NOT to do:**
- ❌ Don't use the same password everywhere
- ❌ Don't share passwords with anyone
- ❌ Don't write passwords on sticky notes
- ❌ Don't use personal information in passwords

**Red Flags - Report Immediately:**
- Unexpected password reset emails
- Login alerts from unknown locations
- Suspicious emails asking for passwords
- Applications asking for re-authentication

**Get Help:** Contact Security Team at security@company.com for any concerns.
              `,
              nextStep: 'security-training',
            },
          ],
        },
      ];

      set({ flows: mockFlows, isLoading: false });
    } catch (_error) {
      set({ error: 'Failed to load guided flows', isLoading: false });
    }
  },

  getFlow: (id: string) => {
    return get().flows.find((flow) => flow.id === id);
  },

  startFlow: (flowId: string) => {
    const flow = get().getFlow(flowId);
    if (!flow || flow.steps.length === 0) return;

    const session: FlowSession = {
      flowId,
      currentStepId: flow.steps[0].id,
      answers: {},
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };

    set({ activeSession: session });
  },

  nextStep: (stepId: string, answer?: any) => {
    const state = get();
    if (!state.activeSession) return;

    const flow = state.getFlow(state.activeSession.flowId);
    if (!flow) return;

    const currentStep = flow.steps.find((step) => step.id === stepId);
    if (!currentStep) return;

    let nextStepId = currentStep.nextStep;

    // If it's a question with options and an answer, find the next step from the selected option
    if (currentStep.type === 'question' && currentStep.options && answer) {
      const selectedOption = currentStep.options.find((opt) => opt.id === answer);
      if (selectedOption) {
        nextStepId = selectedOption.nextStep;
      }
    }

    const updatedAnswers = { ...state.activeSession.answers };
    if (answer !== undefined) {
      updatedAnswers[stepId] = answer;
    }

    set({
      activeSession: {
        ...state.activeSession,
        currentStepId: nextStepId || stepId,
        answers: updatedAnswers,
        lastUpdatedAt: new Date().toISOString(),
      },
    });
  },

  previousStep: () => {
    // Implementation for going back - would need to track step history
    // For now, this is a placeholder
  },

  completeFlow: () => {
    set({ activeSession: null });
  },

  resetFlow: () => {
    set({ activeSession: null });
  },

  updateAnswer: (stepId: string, answer: any) => {
    const state = get();
    if (!state.activeSession) return;

    set({
      activeSession: {
        ...state.activeSession,
        answers: {
          ...state.activeSession.answers,
          [stepId]: answer,
        },
        lastUpdatedAt: new Date().toISOString(),
      },
    });
  },
}));
