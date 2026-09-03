/**
 * jobsApi: Frontend service for communicating with the TRINETRA background AI engine.
 * Never blocks the UI thread. Uses asynchronous job creation, lightweight polling, and cancellation.
 */

export interface DetectionItem {
  id: string;
  track_id?: number;
  plateNumber: string;
  confidence: number;
  vehicleClass: string;
  color?: string;
  timestamp?: string;
  videoTimestamp?: string;
  bbox?: [number, number, number, number];
  violation?: string | null;
  plate_locked?: boolean;
  skipped_ocr_frames?: number;
}

export interface JobCreateResponse {
  job_id: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  message: string;
  created_at: number;
}

export interface JobStatusResponse {
  job_id: string;
  job_type: 'image' | 'video';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  stage: string;
  error?: string | null;
  created_at: number;
  updated_at: number;
}

export interface JobResultResponse {
  job_id: string;
  job_type: 'image' | 'video';
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  stage: string;
  error?: string | null;
  total_frames: number;
  processed_frames: number;
  fps: number;
  execution_time_seconds: number;
  detections: DetectionItem[];
  annotated_image?: string;
  summary: {
    platesDetected?: number;
    uniquePlatesCount?: number;
    violationsCount?: number;
    cleanCount?: number;
    sampleRate?: number;
    processedTime?: string;
    [key: string]: any;
  };
}

const API_BASE = 'http://127.0.0.1:8000';

export const jobsApi = {
  /**
   * Health check to ensure the FastAPI background engine is operational.
   */
  async checkHealth(): Promise<{ status: string; worker_active: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
      if (!res.ok) throw new Error(`Health check returned ${res.status}`);
      return await res.json();
    } catch (err) {
      return { status: 'offline', worker_active: false };
    }
  },

  /**
   * Submits an image for asynchronous background analysis.
   * Returns immediately with job_id. Does NOT wait for inference.
   */
  async uploadImage(file: File, sourceName?: string): Promise<JobCreateResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (sourceName) formData.append('source_name', sourceName);

    const res = await fetch(`${API_BASE}/api/jobs/image`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Failed to submit image job.');
    }

    return await res.json();
  },

  /**
   * Submits a video for real-time live AI video streaming.
   * Returns stream URL for live CCTV feed rendering.
   */
  async uploadVideoStream(file: File, sampleRate: number = 5): Promise<{ status: string; stream_id: string; stream_url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/video/process`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Failed to submit video stream.');
    }

    const data = await res.json();
    return {
      status: data.status,
      stream_id: data.stream_id,
      stream_url: `${API_BASE}${data.stream_url}&sample_rate=${sampleRate}`
    };
  },

  /**
   * Submits a video for asynchronous background analysis.
   * Returns immediately with job_id. Does NOT wait for inference.
   */
  async uploadVideo(file: File, sourceName?: string): Promise<JobCreateResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (sourceName) formData.append('source_name', sourceName);

    const res = await fetch(`${API_BASE}/api/jobs/video`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Failed to submit video job.');
    }

    return await res.json();
  },

  /**
   * Retrieves current job status and throttled progress.
   */
  async getStatus(jobId: string): Promise<JobStatusResponse> {
    const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);
    if (!res.ok) throw new Error(`Failed to fetch job status: ${res.statusText}`);
    return await res.json();
  },

  /**
   * Retrieves final structured detections and summary metrics once completed.
   */
  async getResult(jobId: string): Promise<JobResultResponse> {
    const res = await fetch(`${API_BASE}/api/jobs/${jobId}/result`);
    if (!res.ok) throw new Error(`Failed to fetch job result: ${res.statusText}`);
    return await res.json();
  },

  /**
   * Cancels a running or queued job.
   */
  async cancelJob(jobId: string): Promise<void> {
    await fetch(`${API_BASE}/api/jobs/${jobId}/cancel`, { method: 'POST' });
  },

  /**
   * Retrieves live detections saved in MongoDB.
   */
  async getDetections(params?: { limit?: number; plate?: string; violationOnly?: boolean }): Promise<DetectionItem[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.plate) queryParams.append('plate', params.plate);
      if (params?.violationOnly) queryParams.append('violation_only', 'true');

      const res = await fetch(`${API_BASE}/api/detections?${queryParams.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.detections || [];
    } catch {
      return [];
    }
  },

  /**
   * Retrieves MongoDB storage statistics.
   */
  async getStats(): Promise<{ connected: boolean; total_detections: number; unique_plates: number; total_violations: number }> {
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      if (!res.ok) return { connected: false, total_detections: 0, unique_plates: 0, total_violations: 0 };
      return await res.json();
    } catch {
      return { connected: false, total_detections: 0, unique_plates: 0, total_violations: 0 };
    }
  },

  /**
   * Retrieves live AI GPU Model Status & VRAM utilization.
   */
  async getModelStatus(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/api/models/status`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Retrieves stored cameras from MongoDB.
   */
  async getCameras(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/api/cameras`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.cameras || [];
    } catch {
      return [];
    }
  },

  /**
   * Persists a newly added camera to MongoDB.
   */
  async addCamera(camera: any): Promise<any> {
    const res = await fetch(`${API_BASE}/api/cameras`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(camera),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to save camera' }));
      throw new Error(err.detail || 'Failed to persist camera node in database.');
    }

    const data = await res.json();
    return data.camera;
  },

  /**
   * Removes a camera from MongoDB.
   */
  async deleteCamera(id: string): Promise<void> {
    await fetch(`${API_BASE}/api/cameras/${id}`, { method: 'DELETE' });
  },

  /**
   * Helper that polls job progress at a healthy interval (e.g. 700ms) without overloading React or network.
   */
  async pollJob(
    jobId: string,
    onProgress: (status: JobStatusResponse) => void,
    intervalMs = 700
  ): Promise<JobResultResponse> {
    return new Promise((resolve, reject) => {
      let isDone = false;

      const timer = setInterval(async () => {
        if (isDone) return;
        try {
          const status = await this.getStatus(jobId);
          onProgress(status);

          if (status.status === 'COMPLETED') {
            isDone = true;
            clearInterval(timer);
            const result = await this.getResult(jobId);
            resolve(result);
          } else if (status.status === 'FAILED') {
            isDone = true;
            clearInterval(timer);
            reject(new Error(status.error || 'Job processing failed.'));
          } else if (status.status === 'CANCELLED') {
            isDone = true;
            clearInterval(timer);
            reject(new Error('Job was cancelled by user.'));
          }
        } catch (err) {
          isDone = true;
          clearInterval(timer);
          reject(err);
        }
      }, intervalMs);
    });
  }
};
