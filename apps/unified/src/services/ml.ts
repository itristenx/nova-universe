/**
 * Machine Learning Service
 * Handles API calls for ML models and predictions
 */

import { apiClient } from './api';

export interface MLModel {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'inactive' | 'training';
  accuracy: number;
  last_trained: Date;
  [key: string]: any;
}

export interface MLPrediction {
  id: string;
  model_id: string;
  input_data: any;
  prediction: any;
  confidence: number;
  created_at: Date;
  [key: string]: any;
}

class MLService {
  private readonly basePath = '/api/v1/ml';

  async getModels(params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ models: MLModel[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/models`, { params });
    return response.data;
  }

  async getModel(id: string): Promise<MLModel> {
    const response = await apiClient.get(`${this.basePath}/models/${id}`);
    return response.data;
  }

  async getPredictions(params?: {
    model_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{ predictions: MLPrediction[]; total: number }> {
    const response = await apiClient.get(`${this.basePath}/predictions`, { params });
    return response.data;
  }

  async createPrediction(modelId: string, inputData: any): Promise<MLPrediction> {
    const response = await apiClient.post(`${this.basePath}/models/${modelId}/predict`, { input_data: inputData });
    return response.data;
  }

  async getModelMetrics(modelId: string): Promise<any> {
    const response = await apiClient.get(`${this.basePath}/models/${modelId}/metrics`);
    return response.data;
  }
}

export const mlService = new MLService();
