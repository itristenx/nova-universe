'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Lightbulb,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  Zap,
} from 'lucide-react';
import { Alert, AlertDescription } from '../../../components/ui/alert';

// Enhanced validation schema
const ticketSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  category: z.string().min(1, 'Please select a category'),
  subcategory: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  impact: z.enum(['low', 'medium', 'high', 'critical']),
  contactMethod: z.enum(['email', 'phone', 'portal']),
  additionalContacts: z.string().optional(),
  businessJustification: z.string().optional(),
  preferredResolutionDate: z.string().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: Subcategory[];
  estimatedResolutionTime: string;
  requiredFields: string[];
  suggestedPriority: 'low' | 'medium' | 'high' | 'critical';
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
  dynamicFields: DynamicField[];
  knowledgeArticles: KnowledgeArticle[];
}

interface DynamicField {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: Record<string, unknown>;
}

interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  relevanceScore: number;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  preview?: string;
}

interface FormStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
  isComplete: boolean;
  isOptional?: boolean;
}

export default function EnhancedTicketSubmissionForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [suggestedArticles, setSuggestedArticles] = useState<KnowledgeArticle[]>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string | number>>({});

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'medium',
      urgency: 'medium',
      impact: 'medium',
      contactMethod: 'email',
    },
    mode: 'onChange',
  });

  const {
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = form;

  // Define form steps
  const steps: FormStep[] = [
    {
      id: 'issue-details',
      title: 'Issue Details',
      description: 'Tell us about your issue',
      fields: ['title', 'description', 'category'],
      isComplete: false,
    },
    {
      id: 'classification',
      title: 'Classification',
      description: 'Help us categorize and prioritize',
      fields: ['subcategory', 'priority', 'urgency', 'impact'],
      isComplete: false,
    },
    {
      id: 'contact-info',
      title: 'Contact & Timeline',
      description: 'How and when should we reach you?',
      fields: ['contactMethod', 'preferredResolutionDate'],
      isComplete: false,
      isOptional: true,
    },
    {
      id: 'attachments',
      title: 'Attachments',
      description: 'Add supporting files or screenshots',
      fields: [],
      isComplete: false,
      isOptional: true,
    },
  ];

  // Mock categories data
  useEffect(() => {
    const mockCategories: Category[] = [
      {
        id: 'hardware',
        name: 'Hardware Issues',
        description: 'Computer, printer, mobile device problems',
        icon: '🖥️',
        estimatedResolutionTime: '2-4 hours',
        requiredFields: ['title', 'description', 'priority'],
        suggestedPriority: 'medium',
        subcategories: [
          {
            id: 'computer-issue',
            name: 'Computer Not Working',
            description: 'Desktop or laptop hardware problems',
            dynamicFields: [
              {
                id: 'device-type',
                name: 'deviceType',
                type: 'select',
                label: 'Device Type',
                required: true,
                options: ['Desktop', 'Laptop', 'Tablet', 'Monitor'],
              },
              {
                id: 'asset-tag',
                name: 'assetTag',
                type: 'text',
                label: 'Asset Tag Number',
                placeholder: 'e.g., COMP-001234',
                required: false,
              },
            ],
            knowledgeArticles: [
              {
                id: 'kb-1',
                title: 'Troubleshooting Computer Startup Issues',
                summary: 'Step-by-step guide for common startup problems',
                url: '/knowledge/computer-startup-issues',
                relevanceScore: 0.95,
              },
            ],
          },
        ],
      },
      {
        id: 'software',
        name: 'Software Issues',
        description: 'Application problems and installation requests',
        icon: '💻',
        estimatedResolutionTime: '1-3 hours',
        requiredFields: ['title', 'description', 'priority'],
        suggestedPriority: 'medium',
        subcategories: [
          {
            id: 'app-not-working',
            name: 'Application Not Working',
            description: 'Software crashes, errors, or performance issues',
            dynamicFields: [
              {
                id: 'app-name',
                name: 'applicationName',
                type: 'text',
                label: 'Application Name',
                required: true,
              },
              {
                id: 'error-message',
                name: 'errorMessage',
                type: 'textarea',
                label: 'Error Message (if any)',
                placeholder: 'Copy and paste any error messages you see',
                required: false,
              },
            ],
            knowledgeArticles: [
              {
                id: 'kb-2',
                title: 'Common Software Error Solutions',
                summary: 'Quick fixes for frequently reported software issues',
                url: '/knowledge/software-errors',
                relevanceScore: 0.88,
              },
            ],
          },
        ],
      },
      {
        id: 'access',
        name: 'Access & Permissions',
        description: 'Account access, password resets, permissions',
        icon: '🔐',
        estimatedResolutionTime: '30 minutes - 2 hours',
        requiredFields: ['title', 'description', 'priority', 'businessJustification'],
        suggestedPriority: 'high',
        subcategories: [
          {
            id: 'password-reset',
            name: 'Password Reset',
            description: 'Need to reset your password',
            dynamicFields: [
              {
                id: 'account-type',
                name: 'accountType',
                type: 'select',
                label: 'Account Type',
                required: true,
                options: ['Windows/AD', 'Email', 'VPN', 'Application Specific'],
              },
            ],
            knowledgeArticles: [
              {
                id: 'kb-3',
                title: 'Self-Service Password Reset Guide',
                summary: 'Reset your password without creating a ticket',
                url: '/knowledge/password-reset-self-service',
                relevanceScore: 0.92,
              },
            ],
          },
        ],
      },
    ];
    setCategories(mockCategories);
  }, []);

  // Watch for form changes to trigger intelligent suggestions
  const watchedTitle = watch('title');
  const watchedDescription = watch('description');
  const watchedCategory = watch('category');

  // Intelligent field population and suggestions
  useEffect(() => {
    if (watchedTitle && watchedDescription) {
      // Mock AI-powered suggestions based on title and description
      const suggestions = generateIntelligentSuggestions(watchedTitle, watchedDescription);
      setSuggestedArticles(suggestions);

      // Auto-suggest priority based on keywords
      const suggestedPriority = detectPriorityFromText(watchedTitle + ' ' + watchedDescription);
      if (suggestedPriority && suggestedPriority !== watch('priority')) {
        setValue('priority', suggestedPriority);
        setValue('urgency', suggestedPriority);
      }
    }
  }, [watchedTitle, watchedDescription, setValue, watch]);

  // Update selected category and subcategory
  useEffect(() => {
    if (watchedCategory) {
      const category = categories.find((c) => c.id === watchedCategory);
      setSelectedCategory(category || null);

      if (category) {
        setValue('priority', category.suggestedPriority);
        setValue('urgency', category.suggestedPriority);
      }
    }
  }, [watchedCategory, categories, setValue]);

  const generateIntelligentSuggestions = (
    title: string,
    description: string,
  ): KnowledgeArticle[] => {
    const text = (title + ' ' + description).toLowerCase();
    const suggestions: KnowledgeArticle[] = [];

    if (text.includes('password') || text.includes('login') || text.includes('access')) {
      suggestions.push({
        id: 'kb-password',
        title: 'Password and Access Issues Guide',
        summary: 'Comprehensive guide for resolving access problems',
        url: '/knowledge/access-guide',
        relevanceScore: 0.95,
      });
    }

    if (text.includes('slow') || text.includes('performance') || text.includes('crash')) {
      suggestions.push({
        id: 'kb-performance',
        title: 'Computer Performance Troubleshooting',
        summary: 'Steps to improve system performance',
        url: '/knowledge/performance-guide',
        relevanceScore: 0.87,
      });
    }

    return suggestions;
  };

  const detectPriorityFromText = (text: string): 'low' | 'medium' | 'high' | 'critical' | null => {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes('urgent') ||
      lowerText.includes('critical') ||
      lowerText.includes('emergency')
    ) {
      return 'critical';
    }
    if (
      lowerText.includes('asap') ||
      lowerText.includes('important') ||
      lowerText.includes('blocking')
    ) {
      return 'high';
    }
    if (
      lowerText.includes('minor') ||
      lowerText.includes('cosmetic') ||
      lowerText.includes('enhancement')
    ) {
      return 'low';
    }

    return null;
  };

  // File handling function
  const handleFiles = useCallback((files: File[]) => {
    files.forEach((file) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      // Validate file type
      const allowedTypes = [
        'image/',
        'application/pdf',
        'text/',
        'application/msword',
        'application/vnd.openxmlformats',
      ];
      if (!allowedTypes.some((type) => file.type.startsWith(type))) {
        alert(`File type ${file.type} is not allowed.`);
        return;
      }

      const fileId = Date.now() + Math.random().toString(36);
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      };

      // Generate preview for images
      if (file.type.startsWith('image/')) {
        uploadedFile.preview = uploadedFile.url;
      }

      setUploadedFiles((prev) => [...prev, uploadedFile]);
    });
  }, []);

  // File upload handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [handleFiles],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files);
        handleFiles(files);
      }
    },
    [handleFiles],
  );

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  // Step navigation
  const goToNextStep = async () => {
    const currentStepData = steps[currentStep];
    const fieldsToValidate = currentStepData.fields;

    if (fieldsToValidate.length > 0) {
      const isStepValid = await trigger(fieldsToValidate as (keyof TicketFormData)[]);
      if (!isStepValid && !currentStepData.isOptional) {
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form submission
  const onSubmit = async (data: TicketFormData) => {
    setIsSubmitting(true);
    setSubmitProgress(0);

    try {
      // Simulate submission progress
      const progressInterval = setInterval(() => {
        setSubmitProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Mock API call
      const formData = {
        ...data,
        ...dynamicFieldValues,
        attachments: uploadedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        submittedAt: new Date().toISOString(),
      };

      console.log('Submitting ticket:', formData);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSubmitProgress(100);

      // Redirect to success page or ticket view
      setTimeout(() => {
        router.push('/tickets?success=true');
      }, 1000);
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <Paperclip className="h-4 w-4" />;
  };

  const renderDynamicFields = () => {
    if (!selectedSubcategory?.dynamicFields) return null;

    return selectedSubcategory.dynamicFields.map((field) => (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.name}>
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </Label>

        {field.type === 'text' && (
          <Input
            id={field.name}
            placeholder={field.placeholder}
            value={String(dynamicFieldValues[field.name] || '')}
            onChange={(e) =>
              setDynamicFieldValues((prev) => ({
                ...prev,
                [field.name]: e.target.value,
              }))
            }
            required={field.required}
          />
        )}

        {field.type === 'textarea' && (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            value={String(dynamicFieldValues[field.name] || '')}
            onChange={(e) =>
              setDynamicFieldValues((prev) => ({
                ...prev,
                [field.name]: e.target.value,
              }))
            }
            required={field.required}
          />
        )}

        {field.type === 'select' && field.options && (
          <Select
            value={String(dynamicFieldValues[field.name] || '')}
            onValueChange={(value) =>
              setDynamicFieldValues((prev) => ({
                ...prev,
                [field.name]: value,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    ));
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Submit a Support Request</h1>
        <p className="text-gray-600">
          We&apos;re here to help! Follow the steps below to submit your request.
        </p>
      </div>

      {/* Progress indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />

            {/* Step indicators */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-1 ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      index < currentStep
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : index === currentStep
                          ? 'border-blue-600 bg-white text-blue-600'
                          : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className="max-w-20 text-center text-xs">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main form */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Step 1: Issue Details */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {steps[0].title}
              </CardTitle>
              <CardDescription>{steps[0].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Issue Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Issue Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Briefly describe your issue (e.g., 'Cannot access email')"
                  {...form.register('title')}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>

              {/* Issue Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Detailed Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your issue, including:
• What you were trying to do
• What happened instead
• Any error messages you saw
• Steps to reproduce the problem"
                  className={`min-h-32 ${errors.description ? 'border-red-500' : ''}`}
                  {...form.register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
                <div className="text-xs text-gray-500">
                  {watch('description')?.length || 0} / 2000 characters
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {categories.map((category) => (
                    <Card
                      key={category.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        watch('category') === category.id ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => {
                        setValue('category', category.id);
                        trigger('category');
                      }}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-2 text-center">
                          <div className="mb-2 text-3xl">{category.icon}</div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {category.estimatedResolutionTime}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              {/* Knowledge Base Suggestions */}
              {suggestedArticles.length > 0 && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">
                        We found some articles that might help solve your issue:
                      </p>
                      {suggestedArticles.map((article) => (
                        <div key={article.id} className="rounded border bg-white p-2">
                          <h4 className="text-sm font-medium">{article.title}</h4>
                          <p className="text-xs text-gray-600">{article.summary}</p>
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => window.open(article.url, '_blank')}
                          >
                            Read Article →
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Classification */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                {steps[1].title}
              </CardTitle>
              <CardDescription>{steps[1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subcategory */}
              {selectedCategory && selectedCategory.subcategories.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    value={watch('subcategory') || ''}
                    onValueChange={(value) => {
                      setValue('subcategory', value);
                      const subcategory = selectedCategory.subcategories.find(
                        (s) => s.id === value,
                      );
                      setSelectedSubcategory(subcategory || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory.subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          <div className="text-left">
                            <div className="font-medium">{sub.name}</div>
                            <div className="text-xs text-gray-500">{sub.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Dynamic Fields */}
              {renderDynamicFields()}

              {/* Priority, Urgency, Impact Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={watch('priority')}
                    onValueChange={(value) =>
                      setValue('priority', value as 'low' | 'medium' | 'high' | 'critical')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Low
                          </Badge>
                          <span className="text-sm">Minor impact</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            Medium
                          </Badge>
                          <span className="text-sm">Normal priority</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-orange-100 text-orange-800">
                            High
                          </Badge>
                          <span className="text-sm">Important issue</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="critical">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-red-100 text-red-800">
                            Critical
                          </Badge>
                          <span className="text-sm">Business critical</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select
                    value={watch('urgency')}
                    onValueChange={(value) =>
                      setValue('urgency', value as 'low' | 'medium' | 'high' | 'critical')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Can wait</SelectItem>
                      <SelectItem value="medium">Medium - Normal timeframe</SelectItem>
                      <SelectItem value="high">High - Need soon</SelectItem>
                      <SelectItem value="critical">Critical - Need immediately</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="impact">Impact</Label>
                  <Select
                    value={watch('impact')}
                    onValueChange={(value) =>
                      setValue('impact', value as 'low' | 'medium' | 'high' | 'critical')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Affects only me</SelectItem>
                      <SelectItem value="medium">Medium - Affects my team</SelectItem>
                      <SelectItem value="high">High - Affects department</SelectItem>
                      <SelectItem value="critical">Critical - Affects whole company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Business Justification for high priority */}
              {(watch('priority') === 'high' || watch('priority') === 'critical') && (
                <div className="space-y-2">
                  <Label htmlFor="businessJustification">
                    Business Justification <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="businessJustification"
                    placeholder="Please explain why this issue requires high priority treatment and how it impacts business operations..."
                    {...form.register('businessJustification')}
                    className="min-h-24"
                  />
                  <p className="text-xs text-gray-500">
                    Required for high and critical priority issues
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Contact & Timeline */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {steps[2].title}
              </CardTitle>
              <CardDescription>{steps[2].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Method */}
              <div className="space-y-2">
                <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    {
                      value: 'email',
                      label: 'Email',
                      icon: Mail,
                      description: 'Updates via email',
                    },
                    {
                      value: 'phone',
                      label: 'Phone',
                      icon: Phone,
                      description: 'Call for urgent updates',
                    },
                    {
                      value: 'portal',
                      label: 'Portal Only',
                      icon: Building,
                      description: 'Check status online',
                    },
                  ].map((method) => (
                    <Card
                      key={method.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        watch('contactMethod') === method.value
                          ? 'bg-blue-50 ring-2 ring-blue-500'
                          : ''
                      }`}
                      onClick={() =>
                        setValue('contactMethod', method.value as 'email' | 'phone' | 'portal')
                      }
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-2 text-center">
                          <method.icon className="mx-auto h-8 w-8 text-blue-600" />
                          <h3 className="font-semibold">{method.label}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Additional Contacts */}
              <div className="space-y-2">
                <Label htmlFor="additionalContacts">Additional Contacts (Optional)</Label>
                <Input
                  id="additionalContacts"
                  placeholder="Email addresses of people who should be notified (comma-separated)"
                  {...form.register('additionalContacts')}
                />
                <p className="text-xs text-gray-500">
                  Others who should receive updates about this request
                </p>
              </div>

              {/* Preferred Resolution Date */}
              <div className="space-y-2">
                <Label htmlFor="preferredResolutionDate">
                  Preferred Resolution Date (Optional)
                </Label>
                <Input
                  id="preferredResolutionDate"
                  type="date"
                  {...form.register('preferredResolutionDate')}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500">
                  When would you like this resolved? (We&apos;ll do our best to meet this timeline)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Attachments */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                {steps[3].title}
              </CardTitle>
              <CardDescription>{steps[3].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    Drag and drop files here, or{' '}
                    <label className="cursor-pointer text-blue-600 hover:text-blue-500">
                      browse
                      <input
                        type="file"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported formats: Images, PDF, Word, Excel, Text files
                  </p>
                  <p className="text-xs text-gray-400">Maximum file size: 10MB per file</p>
                </div>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Attached Files ({uploadedFiles.length})</h3>
                  <div className="grid gap-3">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-3 rounded-lg border p-3">
                        {file.preview ? (
                          <Image
                            src={file.preview}
                            alt={file.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100">
                            {getFileIcon(file.type)}
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 0 || isSubmitting}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={goToNextStep} disabled={isSubmitting}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={!isValid || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            )}
          </div>
        </div>

        {/* Submission Progress */}
        {isSubmitting && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4 text-center">
                <div className="space-y-2">
                  <p className="font-medium">Submitting your request...</p>
                  <Progress value={submitProgress} className="w-full" />
                  <p className="text-sm text-gray-500">{submitProgress}% complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
