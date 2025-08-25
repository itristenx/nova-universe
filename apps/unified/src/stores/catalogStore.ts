import { create } from 'zustand';

// Core Catalog Item Types
export interface CatalogItem {
  id: string;
  name: string;
  short_description: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  status: 'active' | 'inactive' | 'draft';

  // Pricing Information
  price: number;
  recurring_price?: number;
  currency: string;
  pricing_model: 'fixed' | 'calculated' | 'variable' | 'tiered';
  cost_center?: string;

  // Cost Tracking
  base_cost: number;
  vendor_cost?: number;
  internal_cost?: number;
  markup_percentage?: number;
  profit_margin?: number;

  // Departmental Billing
  billing_type: 'one_time' | 'recurring' | 'usage_based' | 'license_based';
  license_type?: 'per_user' | 'per_device' | 'site_license' | 'concurrent';
  license_cost_per_unit?: number;
  minimum_licenses?: number;

  // Workflow & Fulfillment
  workflow_id?: string;
  fulfillment_group?: string;
  approval_required: boolean;
  auto_approval_threshold?: number;
  sla_hours?: number;

  // Variables & Configuration
  variables: CatalogVariable[];
  form_layout?: FormLayout;

  // Visibility & Access
  available_for: string[]; // User roles/groups
  departments: string[]; // Allowed departments
  locations: string[]; // Allowed locations

  // Content & Media
  icon?: string;
  image?: string;
  attachments?: Attachment[];
  tags: string[];

  // Metadata
  created_by: string;
  created_at: Date;
  updated_by: string;
  updated_at: Date;
  version: number;
  active_from?: Date;
  active_until?: Date;

  // Analytics
  order_count: number;
  average_rating?: number;
  last_ordered?: Date;
}

export interface CatalogCategory {
  id: string;
  name: string;
  description: string;
  parent_id?: string;
  icon?: string;
  order_index: number;
  status: 'active' | 'inactive';
  subcategories?: CatalogCategory[];
  item_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CatalogVariable {
  id: string;
  name: string;
  label: string;
  type:
    | 'string'
    | 'integer'
    | 'boolean'
    | 'choice'
    | 'multiple_choice'
    | 'reference'
    | 'date'
    | 'file'
    | 'email'
    | 'url'
    | 'currency'
    | 'duration';
  order: number;
  mandatory: boolean;
  read_only: boolean;
  default_value?: any;

  // Pricing Impact
  price_if_checked?: number;
  recurring_price_if_checked?: number;
  pricing_implications: boolean;

  // Validation
  min_length?: number;
  max_length?: number;
  regex_validation?: string;
  validation_message?: string;

  // Choice Options
  choices?: VariableChoice[];
  reference_table?: string;
  reference_field?: string;

  // Display
  tooltip?: string;
  help_text?: string;
  placeholder?: string;
  css_class?: string;
  container_type?: 'none' | 'fieldset' | 'tab';
}

export interface VariableChoice {
  value: string;
  label: string;
  price_modifier?: number;
  recurring_price_modifier?: number;
  order: number;
  active: boolean;
}

export interface FormLayout {
  sections: FormSection[];
  layout_type: 'single_column' | 'two_column' | 'tabbed' | 'wizard';
  theme?: string;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  collapsed: boolean;
  variable_ids: string[];
}

export interface Attachment {
  id: string;
  name: string;
  content_type: string;
  size: number;
  url: string;
  uploaded_by: string;
  uploaded_at: Date;
}

// Request & Order Management
export interface CatalogRequest {
  id: string;
  number: string;
  item_id: string;
  item_name: string;

  // User Information
  requested_by: string;
  requested_for?: string;
  department: string;
  cost_center: string;
  manager?: string;

  // Financial Information
  unit_price: number;
  quantity: number;
  total_price: number;
  recurring_cost?: number;
  currency: string;
  budget_code?: string;
  purchase_order?: string;

  // Billing & Cost Allocation
  billing_department: string;
  billing_contact: string;
  charge_to_department: string;
  accounting_code?: string;
  project_code?: string;

  // License Tracking (for software/subscriptions)
  license_details?: {
    type: 'per_user' | 'per_device' | 'site_license' | 'concurrent';
    allocated_users?: string[];
    allocated_devices?: string[];
    license_start_date?: Date;
    license_end_date?: Date;
    auto_renewal: boolean;
    usage_tracking: boolean;
  };

  // Status & Workflow
  state:
    | 'draft'
    | 'submitted'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'ordered'
    | 'fulfilling'
    | 'delivered'
    | 'closed'
    | 'cancelled';
  approval_status: 'not_required' | 'pending' | 'approved' | 'rejected';
  workflow_state?: string;

  // Variable Values
  variables: Record<string, any>;

  // Tracking
  submitted_at?: Date;
  approved_at?: Date;
  fulfilled_at?: Date;
  delivered_at?: Date;
  closed_at?: Date;

  // Comments & Communication
  comments: RequestComment[];
  delivery_instructions?: string;

  // Metadata
  created_at: Date;
  updated_at: Date;
}

export interface RequestComment {
  id: string;
  user: string;
  comment: string;
  type: 'user' | 'system' | 'approval';
  created_at: Date;
}

// Cost Management & Billing
export interface DepartmentCostCenter {
  id: string;
  department_name: string;
  cost_center_code: string;
  budget_holder: string;
  monthly_budget: number;
  annual_budget: number;
  currency: string;

  // Cost Allocation Rules
  allocation_rules: CostAllocationRule[];

  // License Management
  license_allocations: LicenseAllocation[];

  // Billing Information
  billing_contact: string;
  billing_email: string;
  billing_frequency: 'monthly' | 'quarterly' | 'annually';
  charge_back_enabled: boolean;

  created_at: Date;
  updated_at: Date;
}

export interface CostAllocationRule {
  id: string;
  rule_name: string;
  item_category?: string;
  item_id?: string;
  allocation_type: 'percentage' | 'fixed_amount' | 'per_user' | 'usage_based';
  allocation_value: number;
  effective_from: Date;
  effective_until?: Date;
  active: boolean;
}

export interface LicenseAllocation {
  id: string;
  item_id: string;
  license_type: string;
  total_licenses: number;
  allocated_licenses: number;
  available_licenses: number;
  cost_per_license: number;
  billing_frequency: 'monthly' | 'annually';

  // User Assignments
  user_assignments: UserLicenseAssignment[];

  // Cost Tracking
  monthly_cost: number;
  annual_cost: number;
  last_billed: Date;
  next_billing: Date;

  created_at: Date;
  updated_at: Date;
}

export interface UserLicenseAssignment {
  user_id: string;
  user_name: string;
  assigned_date: Date;
  last_used?: Date;
  usage_count: number;
  cost_allocation: number;
}

// Billing & Reporting
export interface BillingReport {
  id: string;
  department: string;
  period_start: Date;
  period_end: Date;

  // Cost Breakdown
  one_time_costs: number;
  recurring_costs: number;
  license_costs: number;
  usage_costs: number;
  total_costs: number;
  currency: string;

  // Line Items
  line_items: BillingLineItem[];

  // Status
  status: 'draft' | 'pending_review' | 'approved' | 'sent' | 'paid';
  generated_at: Date;
  approved_by?: string;
  approved_at?: Date;
}

export interface BillingLineItem {
  item_id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  billing_type: string;
  period_start: Date;
  period_end: Date;
  request_number?: string;
}

// Store Interface
interface CatalogStore {
  // Catalog Management
  categories: CatalogCategory[];
  items: CatalogItem[];
  requests: CatalogRequest[];

  // Cost Management
  departmentCostCenters: DepartmentCostCenter[];
  billingReports: BillingReport[];

  // UI State
  selectedCategory: string | null;
  selectedItem: CatalogItem | null;
  searchQuery: string;
  filters: CatalogFilters;

  // Actions - Catalog Management
  createCategory: (category: Omit<CatalogCategory, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCategory: (id: string, updates: Partial<CatalogCategory>) => void;
  deleteCategory: (id: string) => void;

  createItem: (
    item: Omit<CatalogItem, 'id' | 'created_at' | 'updated_at' | 'version' | 'order_count'>,
  ) => void;
  updateItem: (id: string, updates: Partial<CatalogItem>) => void;
  deleteItem: (id: string) => void;
  duplicateItem: (id: string) => void;

  // Actions - Request Management
  createRequest: (
    request: Omit<CatalogRequest, 'id' | 'number' | 'created_at' | 'updated_at'>,
  ) => void;
  updateRequest: (id: string, updates: Partial<CatalogRequest>) => void;
  submitRequest: (id: string) => void;
  approveRequest: (id: string, approver: string) => void;
  rejectRequest: (id: string, approver: string, reason: string) => void;

  // Actions - Cost Management
  createCostCenter: (
    costCenter: Omit<DepartmentCostCenter, 'id' | 'created_at' | 'updated_at'>,
  ) => void;
  updateCostCenter: (id: string, updates: Partial<DepartmentCostCenter>) => void;
  allocateLicense: (costCenterId: string, itemId: string, userId: string) => void;
  deallocateLicense: (costCenterId: string, itemId: string, userId: string) => void;

  // Actions - Billing
  generateBillingReport: (departmentId: string, startDate: Date, endDate: Date) => BillingReport;
  approveBillingReport: (reportId: string, approver: string) => void;

  // Actions - Filtering & Search
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedItem: (item: CatalogItem | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<CatalogFilters>) => void;

  // Actions - Data Loading
  setCategories: (categories: CatalogCategory[]) => void;
  setItems: (items: CatalogItem[]) => void;
  setRequests: (requests: CatalogRequest[]) => void;
  setCostCenters: (costCenters: DepartmentCostCenter[]) => void;

  // Computed
  getItemsByCategory: (categoryId: string) => CatalogItem[];
  getFilteredItems: () => CatalogItem[];
  getDepartmentCosts: (departmentId: string, startDate: Date, endDate: Date) => BillingReport;
  getLicenseUtilization: (itemId: string) => LicenseUtilization;
}

export interface CatalogFilters {
  category: string | null;
  priceRange: [number, number];
  status: string[];
  departments: string[];
  tags: string[];
  billingType: string[];
}

export interface LicenseUtilization {
  total_licenses: number;
  allocated_licenses: number;
  active_users: number;
  utilization_percentage: number;
  cost_per_active_user: number;
  waste_cost: number;
}

// Create Store
export const useCatalogStore = create<CatalogStore>((set, get) => ({
  // Initial State
  categories: [],
  items: [],
  requests: [],
  departmentCostCenters: [],
  billingReports: [],
  selectedCategory: null,
  selectedItem: null,
  searchQuery: '',
  filters: {
    category: null,
    priceRange: [0, 10000],
    status: ['active'],
    departments: [],
    tags: [],
    billingType: [],
  },

  // Category Management
  createCategory: (categoryData) => {
    const newCategory: CatalogCategory = {
      ...categoryData,
      id: `cat_${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
      item_count: 0,
    };

    set((state) => ({
      categories: [...state.categories, newCategory],
    }));
  },

  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates, updated_at: new Date() } : cat,
      ),
    }));
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
      items: state.items.filter((item) => item.category_id !== id),
    }));
  },

  // Item Management
  createItem: (itemData) => {
    const newItem: CatalogItem = {
      ...itemData,
      id: `item_${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
      version: 1,
      order_count: 0,
    };

    set((state) => ({
      items: [...state.items, newItem],
      categories: state.categories.map((cat) =>
        cat.id === newItem.category_id ? { ...cat, item_count: cat.item_count + 1 } : cat,
      ),
    }));
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, ...updates, updated_at: new Date(), version: item.version + 1 }
          : item,
      ),
    }));
  },

  deleteItem: (id) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;

    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      categories: state.categories.map((cat) =>
        cat.id === item.category_id ? { ...cat, item_count: Math.max(0, cat.item_count - 1) } : cat,
      ),
    }));
  },

  duplicateItem: (id) => {
    const originalItem = get().items.find((item) => item.id === id);
    if (!originalItem) return;

    const duplicatedItem: CatalogItem = {
      ...originalItem,
      id: `item_${Date.now()}`,
      name: `${originalItem.name} (Copy)`,
      created_at: new Date(),
      updated_at: new Date(),
      version: 1,
      order_count: 0,
    };

    set((state) => ({
      items: [...state.items, duplicatedItem],
    }));
  },

  // Request Management
  createRequest: (requestData) => {
    const newRequest: CatalogRequest = {
      ...requestData,
      id: `req_${Date.now()}`,
      number: `REQ${Date.now().toString().slice(-6)}`,
      created_at: new Date(),
      updated_at: new Date(),
      comments: [],
    };

    set((state) => ({
      requests: [...state.requests, newRequest],
      items: state.items.map((item) =>
        item.id === newRequest.item_id
          ? { ...item, order_count: item.order_count + 1, last_ordered: new Date() }
          : item,
      ),
    }));
  },

  updateRequest: (id, updates) => {
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id ? { ...req, ...updates, updated_at: new Date() } : req,
      ),
    }));
  },

  submitRequest: (id) => {
    const request = get().requests.find((req) => req.id === id);
    if (!request) return;

    const updates: Partial<CatalogRequest> = {
      state: 'submitted',
      submitted_at: new Date(),
    };

    // Check if approval is required
    const item = get().items.find((item) => item.id === request.item_id);
    if (item?.approval_required) {
      updates.approval_status = 'pending';
      updates.state = 'pending_approval';
    } else {
      updates.approval_status = 'not_required';
      updates.state = 'approved';
      updates.approved_at = new Date();
    }

    get().updateRequest(id, updates);
  },

  approveRequest: (id, approver) => {
    get().updateRequest(id, {
      state: 'approved',
      approval_status: 'approved',
      approved_at: new Date(),
      comments: [
        ...(get().requests.find((req) => req.id === id)?.comments || []),
        {
          id: `comment_${Date.now()}`,
          user: approver,
          comment: 'Request approved',
          type: 'approval',
          created_at: new Date(),
        },
      ],
    });
  },

  rejectRequest: (id, approver, reason) => {
    get().updateRequest(id, {
      state: 'rejected',
      approval_status: 'rejected',
      comments: [
        ...(get().requests.find((req) => req.id === id)?.comments || []),
        {
          id: `comment_${Date.now()}`,
          user: approver,
          comment: `Request rejected: ${reason}`,
          type: 'approval',
          created_at: new Date(),
        },
      ],
    });
  },

  // Cost Center Management
  createCostCenter: (costCenterData) => {
    const newCostCenter: DepartmentCostCenter = {
      ...costCenterData,
      id: `cc_${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    set((state) => ({
      departmentCostCenters: [...state.departmentCostCenters, newCostCenter],
    }));
  },

  updateCostCenter: (id, updates) => {
    set((state) => ({
      departmentCostCenters: state.departmentCostCenters.map((cc) =>
        cc.id === id ? { ...cc, ...updates, updated_at: new Date() } : cc,
      ),
    }));
  },

  allocateLicense: (_costCenterId, _itemId, _userId) => {
    // Implementation for license allocation
    const costCenter = get().departmentCostCenters.find((cc) => cc.id === _costCenterId);
    if (!costCenter) return;

    // Update license allocation logic here
  },

  deallocateLicense: (_costCenterId, _itemId, _userId) => {
    // Implementation for license deallocation
  },

  // Billing Management
  generateBillingReport: (departmentId, startDate, endDate) => {
    const requests = get().requests.filter(
      (req) =>
        req.department === departmentId &&
        req.created_at >= startDate &&
        req.created_at <= endDate &&
        ['approved', 'delivered', 'closed'].includes(req.state),
    );

    const lineItems: BillingLineItem[] = requests.map((req) => {
      const item = get().items.find((item) => item.id === req.item_id);
      return {
        item_id: req.item_id,
        item_name: req.item_name,
        category: item?.category_id || 'Unknown',
        quantity: req.quantity,
        unit_cost: req.unit_price,
        total_cost: req.total_price,
        billing_type: item?.billing_type || 'one_time',
        period_start: startDate,
        period_end: endDate,
        request_number: req.number,
      };
    });

    const totalCosts = lineItems.reduce((sum, item) => sum + item.total_cost, 0);

    const billingReport: BillingReport = {
      id: `bill_${Date.now()}`,
      department: departmentId,
      period_start: startDate,
      period_end: endDate,
      one_time_costs: lineItems
        .filter((item) => item.billing_type === 'one_time')
        .reduce((sum, item) => sum + item.total_cost, 0),
      recurring_costs: lineItems
        .filter((item) => item.billing_type === 'recurring')
        .reduce((sum, item) => sum + item.total_cost, 0),
      license_costs: lineItems
        .filter((item) => item.billing_type === 'license_based')
        .reduce((sum, item) => sum + item.total_cost, 0),
      usage_costs: lineItems
        .filter((item) => item.billing_type === 'usage_based')
        .reduce((sum, item) => sum + item.total_cost, 0),
      total_costs: totalCosts,
      currency: 'USD',
      line_items: lineItems,
      status: 'draft',
      generated_at: new Date(),
    };

    set((state) => ({
      billingReports: [...state.billingReports, billingReport],
    }));

    return billingReport;
  },

  approveBillingReport: (reportId, approver) => {
    set((state) => ({
      billingReports: state.billingReports.map((report) =>
        report.id === reportId
          ? { ...report, status: 'approved', approved_by: approver, approved_at: new Date() }
          : report,
      ),
    }));
  },

  // UI State Management
  setSelectedCategory: (categoryId) => {
    set({ selectedCategory: categoryId });
  },

  setSelectedItem: (item) => {
    set({ selectedItem: item });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  // Computed Functions
  getItemsByCategory: (categoryId) => {
    return get().items.filter((item) => item.category_id === categoryId);
  },

  getFilteredItems: () => {
    const { items, searchQuery, filters } = get();

    return items.filter((item) => {
      // Search query filter
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Category filter
      if (filters.category && item.category_id !== filters.category) {
        return false;
      }

      // Price range filter
      if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) {
        return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(item.status)) {
        return false;
      }

      // Department filter
      if (
        filters.departments.length > 0 &&
        !filters.departments.some((dept) => item.departments.includes(dept))
      ) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0 && !filters.tags.some((tag) => item.tags.includes(tag))) {
        return false;
      }

      // Billing type filter
      if (filters.billingType.length > 0 && !filters.billingType.includes(item.billing_type)) {
        return false;
      }

      return true;
    });
  },

  getDepartmentCosts: (departmentId, startDate, endDate) => {
    return get().generateBillingReport(departmentId, startDate, endDate);
  },

  getLicenseUtilization: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) {
      return {
        total_licenses: 0,
        allocated_licenses: 0,
        active_users: 0,
        utilization_percentage: 0,
        cost_per_active_user: 0,
        waste_cost: 0,
      };
    }

    // Calculate license utilization based on allocations
    const allocations = get()
      .departmentCostCenters.flatMap((cc) => cc.license_allocations)
      .filter((la) => la.item_id === itemId);

    const totalLicenses = allocations.reduce((sum, la) => sum + la.total_licenses, 0);
    const allocatedLicenses = allocations.reduce((sum, la) => sum + la.allocated_licenses, 0);
    const activeUsers = allocations.reduce(
      (sum, la) =>
        sum +
        la.user_assignments.filter(
          (ua) => ua.last_used && ua.last_used > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
        ).length,
      0,
    );

    const utilizationPercentage = totalLicenses > 0 ? (activeUsers / totalLicenses) * 100 : 0;
    const costPerActiveUser =
      activeUsers > 0 ? allocations.reduce((sum, la) => sum + la.monthly_cost, 0) / activeUsers : 0;
    const wasteCost = (allocatedLicenses - activeUsers) * (item.license_cost_per_unit || 0);

    return {
      total_licenses: totalLicenses,
      allocated_licenses: allocatedLicenses,
      active_users: activeUsers,
      utilization_percentage: utilizationPercentage,
      cost_per_active_user: costPerActiveUser,
      waste_cost: wasteCost,
    };
  },

  // Data Loading Methods
  setCategories: (categories) => {
    set({ categories });
  },

  setItems: (items) => {
    set({ items });
  },

  setRequests: (requests) => {
    set({ requests });
  },

  setCostCenters: (costCenters) => {
    set({ departmentCostCenters: costCenters });
  },
}));
