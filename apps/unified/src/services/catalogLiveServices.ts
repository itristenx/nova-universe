import { createServiceClient } from './api';
import type {
  CatalogCategory,
  CatalogItem,
  CatalogRequest,
  DepartmentCostCenter,
} from '../stores/catalogStore';

/**
 * Catalog Live API Services
 * Provides real API integration for catalog management
 * Uses the new service catalog API endpoints at /api/service-catalog
 */

export class CatalogService {
  private client = createServiceClient('service-catalog');

  // Category Management
  async getCategories(): Promise<CatalogCategory[]> {
    const response = await this.client.get<CatalogCategory[]>('/categories');
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch categories');
    }
    return response.data;
  }

  async getCategory(id: string): Promise<CatalogCategory> {
    const response = await this.client.get<CatalogCategory>(`/categories/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch category');
    }
    return response.data;
  }

  async createCategory(
    categoryData: Omit<CatalogCategory, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<CatalogCategory> {
    const response = await this.client.post<CatalogCategory>('/categories', categoryData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create category');
    }
    return response.data;
  }

  async updateCategory(id: string, updates: Partial<CatalogCategory>): Promise<CatalogCategory> {
    const response = await this.client.put<CatalogCategory>(`/categories/${id}`, updates);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update category');
    }
    return response.data;
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await this.client.delete(`/categories/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete category');
    }
  }

  async reorderCategories(categoryIds: string[]): Promise<CatalogCategory[]> {
    const response = await this.client.post<CatalogCategory[]>('/categories/reorder', {
      categoryIds,
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to reorder categories');
    }
    return response.data;
  }

  // Item Management
  async getItems(params?: {
    category_id?: string;
    search?: string;
    status?: string;
    tags?: string[];
    priceMin?: number;
    priceMax?: number;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<{
    items: CatalogItem[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const response = await this.client.get<{
      items: CatalogItem[];
      total: number;
      limit: number;
      offset: number;
    }>('/items', { params });

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch items');
    }

    return response.data;
  }

  async getItem(id: string): Promise<CatalogItem> {
    const response = await this.client.get<CatalogItem>(`/items/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch item');
    }
    return response.data;
  }

  async createItem(
    itemData: Omit<CatalogItem, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<CatalogItem> {
    const response = await this.client.post<CatalogItem>('/items', itemData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create item');
    }
    return response.data;
  }

  async updateItem(id: string, updates: Partial<CatalogItem>): Promise<CatalogItem> {
    const response = await this.client.patch<CatalogItem>(`/items/${id}`, updates);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update item');
    }
    return response.data;
  }

  async deleteItem(id: string): Promise<void> {
    const response = await this.client.delete(`/items/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete item');
    }
  }

  async cloneItem(id: string, newName: string): Promise<CatalogItem> {
    const response = await this.client.post<CatalogItem>(`/items/${id}/clone`, { name: newName });
    if (!response.success) {
      throw new Error(response.message || 'Failed to clone item');
    }
    return response.data;
  }

  async bulkUpdateItems(
    updates: Array<{ id: string; data: Partial<CatalogItem> }>,
  ): Promise<CatalogItem[]> {
    const response = await this.client.post<CatalogItem[]>('/items/bulk-update', { updates });
    if (!response.success) {
      throw new Error(response.message || 'Failed to bulk update items');
    }
    return response.data;
  }

  async importItems(file: File): Promise<{ imported: number; errors: string[] }> {
    const response = await this.client.uploadFile<{ imported: number; errors: string[] }>(
      '/items/import',
      file,
    );
    if (!response.success) {
      throw new Error(response.message || 'Failed to import items');
    }
    return response.data;
  }

  async exportItems(format: 'csv' | 'excel' = 'csv', categoryId?: string): Promise<string> {
    const params = categoryId ? `?format=${format}&categoryId=${categoryId}` : `?format=${format}`;
    const response = await this.client.get<{ downloadUrl: string }>(`/items/export${params}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to export items');
    }
    return response.data.downloadUrl;
  }

  // Popular and featured items
  async getPopularItems(limit = 10): Promise<CatalogItem[]> {
    const response = await this.client.get<CatalogItem[]>(`/items/popular?limit=${limit}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch popular items');
    }
    return response.data;
  }

  async getFeaturedItems(): Promise<CatalogItem[]> {
    const response = await this.client.get<CatalogItem[]>('/items/featured');
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch featured items');
    }
    return response.data;
  }

  async getRecentlyAddedItems(limit = 10): Promise<CatalogItem[]> {
    const response = await this.client.get<CatalogItem[]>(`/items/recent?limit=${limit}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch recently added items');
    }
    return response.data;
  }

  // Item pricing and cost calculation
  async calculateItemPrice(
    itemId: string,
    variables: Record<string, any>,
    quantity = 1,
  ): Promise<{
    basePrice: number;
    totalPrice: number;
    breakdown: Array<{ name: string; cost: number; type: 'base' | 'variable' | 'quantity' }>;
  }> {
    const response = await this.client.post<{
      basePrice: number;
      totalPrice: number;
      breakdown: Array<{ name: string; cost: number; type: 'base' | 'variable' | 'quantity' }>;
    }>(`/items/${itemId}/calculate-price`, { variables, quantity });
    if (!response.success) {
      throw new Error(response.message || 'Failed to calculate item price');
    }
    return response.data;
  }
}

export class CatalogRequestService {
  private client = createServiceClient('service-catalog-requests');

  // Request Management
  async getRequests(params?: {
    status?: string;
    item_id?: string;
    requested_by?: string;
    cost_center_id?: string;
    priority?: string;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
  }): Promise<{
    requests: CatalogRequest[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const response = await this.client.get<{
      requests: CatalogRequest[];
      total: number;
      limit: number;
      offset: number;
    }>('/', { params });

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch requests');
    }

    return response.data;
  }

  async getRequest(id: string): Promise<CatalogRequest> {
    const response = await this.client.get<CatalogRequest>(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch request');
    }
    return response.data;
  }

  async createRequest(
    requestData: Omit<CatalogRequest, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<CatalogRequest> {
    const response = await this.client.post<CatalogRequest>('/', requestData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create request');
    }
    return response.data;
  }

  async updateRequest(id: string, updates: Partial<CatalogRequest>): Promise<CatalogRequest> {
    const response = await this.client.put<CatalogRequest>(`/${id}`, updates);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update request');
    }
    return response.data;
  }

  async cancelRequest(id: string): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to cancel request');
    }
    return response.data;
  }

  async getRequestAnalytics(): Promise<{
    statusCounts: Array<{ status: string; count: number }>;
    monthlyTrends: Array<{ month: string; count: number; total_cost: number }>;
    topItems: Array<{ name: string; request_count: number; total_cost: number }>;
    departmentCosts: Array<{
      department: string;
      request_count: number;
      total_cost: number;
      avg_cost: number;
    }>;
  }> {
    const response = await this.client.get<{
      statusCounts: Array<{ status: string; count: number }>;
      monthlyTrends: Array<{ month: string; count: number; total_cost: number }>;
      topItems: Array<{ name: string; request_count: number; total_cost: number }>;
      departmentCosts: Array<{
        department: string;
        request_count: number;
        total_cost: number;
        avg_cost: number;
      }>;
    }>('/analytics/dashboard');

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch request analytics');
    }

    return response.data;
  }
}

// Cost Center Service
export class CostCenterService {
  private client = createServiceClient('cost-centers');

  // Cost Center Management
  async getCostCenters(): Promise<DepartmentCostCenter[]> {
    const response = await this.client.get<DepartmentCostCenter[]>('/');
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch cost centers');
    }
    return response.data;
  }

  async getCostCenter(id: string): Promise<DepartmentCostCenter> {
    const response = await this.client.get<DepartmentCostCenter>(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch cost center');
    }
    return response.data;
  }

  async createCostCenter(
    costCenterData: Omit<DepartmentCostCenter, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<DepartmentCostCenter> {
    const response = await this.client.post<DepartmentCostCenter>('/', costCenterData);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create cost center');
    }
    return response.data;
  }

  async updateCostCenter(
    id: string,
    updates: Partial<DepartmentCostCenter>,
  ): Promise<DepartmentCostCenter> {
    const response = await this.client.put<DepartmentCostCenter>(`/${id}`, updates);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update cost center');
    }
    return response.data;
  }

  async deleteCostCenter(id: string): Promise<void> {
    const response = await this.client.delete(`/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete cost center');
    }
  }

  async getCostCenterAnalytics(id: string): Promise<{
    monthlyTrends: Array<{ month: string; total_spent: number; request_count: number }>;
    spendingByCategory: Array<{
      category_name: string;
      total_spent: number;
      request_count: number;
    }>;
    topRequestedItems: Array<{
      item_name: string;
      total_quantity: number;
      total_spent: number;
      request_count: number;
    }>;
    quarterlyUtilization: Array<{
      quarter: number;
      year: number;
      spent_amount: number;
      quarterly_budget: number;
    }>;
  }> {
    const response = await this.client.get<{
      monthlyTrends: Array<{ month: string; total_spent: number; request_count: number }>;
      spendingByCategory: Array<{
        category_name: string;
        total_spent: number;
        request_count: number;
      }>;
      topRequestedItems: Array<{
        item_name: string;
        total_quantity: number;
        total_spent: number;
        request_count: number;
      }>;
      quarterlyUtilization: Array<{
        quarter: number;
        year: number;
        spent_amount: number;
        quarterly_budget: number;
      }>;
    }>(`/${id}/analytics`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch cost center analytics');
    }

    return response.data;
  }

  async getBudgetAlerts(id: string): Promise<{
    cost_center: DepartmentCostCenter & { utilization_percentage: number };
    alerts: Array<{ type: string; message: string; details: string }>;
  }> {
    const response = await this.client.get<{
      cost_center: DepartmentCostCenter & { utilization_percentage: number };
      alerts: Array<{ type: string; message: string; details: string }>;
    }>(`/${id}/alerts`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch budget alerts');
    }

    return response.data;
  }

  async getDashboard(): Promise<{
    departmentOverview: Array<{
      department: string;
      cost_center_count: number;
      total_budget: number;
      total_spent: number;
      avg_utilization: number;
    }>;
    alertsSummary: Array<{ alert_level: string; count: number }>;
    topSpenders: Array<{
      name: string;
      department: string;
      budget_limit: number;
      spent_amount: number;
      utilization_percentage: number;
    }>;
    monthlyTrends: Array<{ month: string; total_spent: number; active_cost_centers: number }>;
  }> {
    const response = await this.client.get<{
      departmentOverview: Array<{
        department: string;
        cost_center_count: number;
        total_budget: number;
        total_spent: number;
        avg_utilization: number;
      }>;
      alertsSummary: Array<{ alert_level: string; count: number }>;
      topSpenders: Array<{
        name: string;
        department: string;
        budget_limit: number;
        spent_amount: number;
        utilization_percentage: number;
      }>;
      monthlyTrends: Array<{ month: string; total_spent: number; active_cost_centers: number }>;
    }>('/analytics/dashboard');

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch cost center dashboard');
    }

    return response.data;
  }
}

// Export singleton instances
export const catalogService = new CatalogService();
export const catalogRequestService = new CatalogRequestService();
export const costCenterService = new CostCenterService();
