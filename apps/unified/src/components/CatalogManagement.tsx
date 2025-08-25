import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  CubeIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCatalogStore } from '../stores/catalogStore';
import { cn } from '@utils/index';
import type { CatalogItem, CatalogCategory, BillingReport } from '../stores/catalogStore';

export default function CatalogManagement() {
  const {
    categories,
    items,
    requests,
    departmentCostCenters,
    billingReports,
    selectedCategory,
    selectedItem,
    searchQuery,
    filters,
    setSelectedCategory,
    setSelectedItem,
    setSearchQuery,
    setFilters,
    getFilteredItems,
    createCategory,
    createItem,
    updateItem,
    deleteItem,
    duplicateItem,
    generateBillingReport,
    getDepartmentCosts,
    getLicenseUtilization,
  } = useCatalogStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createMode, setCreateMode] = useState<'category' | 'item'>('item');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  // Mock data for demo
  useEffect(() => {
    if (categories.length === 0) {
      // Create sample categories
      createCategory({
        name: 'Software & Licenses',
        description: 'Software applications, licenses, and digital tools',
        icon: 'package',
        order_index: 1,
        status: 'active',
        item_count: 0,
      });

      createCategory({
        name: 'Hardware & Equipment',
        description: 'Computers, devices, and physical equipment',
        icon: 'monitor',
        order_index: 2,
        status: 'active',
        item_count: 0,
      });

      createCategory({
        name: 'Services & Consulting',
        description: 'Professional services and consulting',
        icon: 'users',
        order_index: 3,
        status: 'active',
        item_count: 0,
      });
    }
  }, [categories.length, createCategory]);

  const filteredItems = getFilteredItems();

  const handleCreateItem = (itemData: any) => {
    createItem({
      ...itemData,
      created_by: 'current_user',
      updated_by: 'current_user',
      variables: [],
      available_for: ['*'],
      departments: ['*'],
      locations: ['*'],
      tags: [],
    });
    setShowCreateDialog(false);
  };

  const totalCatalogValue = items.reduce((sum, item) => sum + item.price, 0);
  const totalMonthlyRecurring = items.reduce((sum, item) => sum + (item.recurring_price || 0), 0);
  const totalActiveRequests = requests.filter((req) =>
    ['pending_approval', 'approved', 'fulfilling'].includes(req.state),
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-slate-900 dark:text-white">
                Service Catalog
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Enterprise-grade service catalog with cost tracking and department billing
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                <ChartBarIcon className="mr-2 h-4 w-4" />
                Analytics
              </button>
              <button
                onClick={() => {
                  setCreateMode('item');
                  setShowCreateDialog(true);
                }}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Catalog Item
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CubeIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Total Catalog Items
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {items.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Catalog Value</dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        ${totalCatalogValue.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Monthly Recurring
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        ${totalMonthlyRecurring.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Active Requests
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {totalActiveRequests}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search catalog items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ category: e.target.value || null })}
                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <button
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                aria-label="Filter options"
              >
                <FunnelIcon className="h-4 w-4" />
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                aria-label={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ? (
                  <ListBulletIcon className="h-4 w-4" />
                ) : (
                  <Squares2X2Icon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Panel */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="mb-8 overflow-hidden rounded-lg bg-white shadow dark:bg-slate-800">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Catalog Analytics & Cost Tracking
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Department costs, license utilization, and billing insights
                  </p>
                </div>
                <div className="p-6">
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      <button className="border-b-2 border-blue-500 px-1 py-2 text-sm font-medium whitespace-nowrap text-blue-600">
                        Department Costs
                      </button>
                      <button className="border-b-2 border-transparent px-1 py-2 text-sm font-medium whitespace-nowrap text-gray-500 hover:border-gray-300 hover:text-gray-700">
                        License Utilization
                      </button>
                      <button className="border-b-2 border-transparent px-1 py-2 text-sm font-medium whitespace-nowrap text-gray-500 hover:border-gray-300 hover:text-gray-700">
                        Trending Items
                      </button>
                      <button className="border-b-2 border-transparent px-1 py-2 text-sm font-medium whitespace-nowrap text-gray-500 hover:border-gray-300 hover:text-gray-700">
                        Billing Reports
                      </button>
                    </nav>
                  </div>

                  <div className="mt-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {departmentCostCenters.map((dept) => (
                        <div key={dept.id} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                          <div className="mb-2 flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {dept.department_name}
                            </h4>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                              {dept.cost_center_code}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Monthly Budget:
                              </span>
                              <span className="text-gray-900 dark:text-white">
                                ${dept.monthly_budget.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Utilized:</span>
                              <span className="text-gray-900 dark:text-white">$0</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200">
                              <div className="h-2 w-0 rounded-full bg-blue-600"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories Navigation */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap',
                selectedCategory === null
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              All Items ({items.length})
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap',
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {category.name} ({category.item_count})
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Items */}
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'space-y-4'
          }
        >
          {filteredItems.map((item) => (
            <CatalogItemCard
              key={item.id}
              item={item}
              viewMode={viewMode}
              onEdit={() => setSelectedItem(item)}
              onDuplicate={() => duplicateItem(item.id)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="py-12 text-center">
            <CubeIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-600">No catalog items found</h3>
            <p className="mb-4 text-gray-500">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start by creating your first catalog item'}
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Catalog Item
            </button>
          </div>
        )}

        {/* Create Item Dialog */}
        {showCreateDialog && (
          <CreateItemDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            mode={createMode}
            categories={categories}
            onCreateItem={handleCreateItem}
            onCreateCategory={(categoryData) => {
              createCategory({
                ...categoryData,
                item_count: 0,
              });
              setShowCreateDialog(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Catalog Item Card Component
interface CatalogItemCardProps {
  item: CatalogItem;
  viewMode: 'grid' | 'list';
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function CatalogItemCard({ item, viewMode, onEdit, onDuplicate, onDelete }: CatalogItemCardProps) {
  if (viewMode === 'list') {
    return (
      <div className="rounded-lg bg-white shadow transition-shadow hover:shadow-lg dark:bg-slate-800">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <CubeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {item.name}
                </h3>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                  {item.short_description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      item.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800',
                    )}
                  >
                    {item.status}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <StarIcon className="h-3 w-3" />
                    {item.average_rating || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <ShoppingCartIcon className="h-3 w-3" />
                    {item.order_count} orders
                  </span>
                </div>
              </div>
            </div>
            <div className="mr-4 text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                ${item.price.toLocaleString()}
              </div>
              {item.recurring_price && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  ${item.recurring_price}/month
                </div>
              )}
              <span className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {item.billing_type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Edit item"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={onDuplicate}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Duplicate item"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Delete item"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer rounded-lg bg-white shadow transition-shadow hover:shadow-lg dark:bg-slate-800">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <CubeIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={onEdit}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Edit item"
            >
              <PencilIcon className="h-3 w-3" />
            </button>
            <button
              onClick={onDuplicate}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Duplicate item"
            >
              <DocumentDuplicateIcon className="h-3 w-3" />
            </button>
            <button
              onClick={onDelete}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
              aria-label="Delete item"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{item.short_description}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${item.price.toLocaleString()}
            </span>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                item.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800',
              )}
            >
              {item.status}
            </span>
          </div>

          {item.recurring_price && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              + ${item.recurring_price}/month recurring
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <StarIcon className="h-3 w-3" />
              {item.average_rating || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingCartIcon className="h-3 w-3" />
              {item.order_count}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              {item.billing_type.replace('_', ' ')}
            </span>
            {item.license_type && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                {item.license_type.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <button className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
          <ShoppingCartIcon className="mr-2 h-4 w-4" />
          Request Item
        </button>
      </div>
    </div>
  );
}

// Create Item Dialog Component
interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'category' | 'item';
  categories: CatalogCategory[];
  onCreateItem: (item: any) => void;
  onCreateCategory: (category: any) => void;
}

function CreateItemDialog({
  open,
  onOpenChange,
  mode,
  categories,
  onCreateItem,
  onCreateCategory,
}: CreateItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    description: '',
    category_id: '',
    price: 0,
    recurring_price: 0,
    currency: 'USD',
    pricing_model: 'fixed',
    billing_type: 'one_time',
    base_cost: 0,
    approval_required: false,
    status: 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'item') {
      onCreateItem(formData);
    } else {
      onCreateCategory({
        name: formData.name,
        description: formData.description,
        order_index: categories.length + 1,
        status: 'active',
      });
    }

    // Reset form
    setFormData({
      name: '',
      short_description: '',
      description: '',
      category_id: '',
      price: 0,
      recurring_price: 0,
      currency: 'USD',
      pricing_model: 'fixed',
      billing_type: 'one_time',
      base_cost: 0,
      approval_required: false,
      status: 'active',
    });
  };

  if (!open) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600">
      <div className="relative top-20 mx-auto w-11/12 rounded-md border bg-white p-5 shadow-lg md:w-2/3 lg:w-1/2">
        <div className="mt-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Create New {mode === 'item' ? 'Catalog Item' : 'Category'}
            </h3>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <p className="mb-6 text-sm text-gray-500">
            {mode === 'item'
              ? 'Add a new item to your service catalog with pricing and cost tracking'
              : 'Create a new category to organize your catalog items'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={mode === 'item' ? 'Microsoft Office 365' : 'Software & Licenses'}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="short_description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Short Description
                </label>
                <input
                  type="text"
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Brief description..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description..."
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {mode === 'item' && (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="billing_type"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Billing Type
                    </label>
                    <select
                      id="billing_type"
                      value={formData.billing_type}
                      onChange={(e) => setFormData({ ...formData, billing_type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="one_time">One Time</option>
                      <option value="recurring">Recurring</option>
                      <option value="usage_based">Usage Based</option>
                      <option value="license_based">License Based</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      id="price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                      }
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="recurring_price"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Recurring Price ($/month)
                    </label>
                    <input
                      type="number"
                      id="recurring_price"
                      value={formData.recurring_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recurring_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="base_cost" className="block text-sm font-medium text-gray-700">
                      Base Cost ($)
                    </label>
                    <input
                      type="number"
                      id="base_cost"
                      value={formData.base_cost}
                      onChange={(e) =>
                        setFormData({ ...formData, base_cost: parseFloat(e.target.value) || 0 })
                      }
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="approval_required"
                    checked={formData.approval_required}
                    onChange={(e) =>
                      setFormData({ ...formData, approval_required: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="approval_required" className="ml-2 block text-sm text-gray-900">
                    Requires Approval
                  </label>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                Create {mode === 'item' ? 'Item' : 'Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
