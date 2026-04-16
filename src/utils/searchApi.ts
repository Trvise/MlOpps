// Simulated API functions for agentic search system
// In production, these would call the Flask backend

export interface TokenizationStatus {
  status: 'idle' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
  totalFrames: number;
  processedFrames: number;
}

export interface SearchResult {
  timestamp: number;
  similarity: number;
  dataValues: Record<string, number>;
  matchedCriteria: string[];
  visualQuery?: string;
}

export interface QueryDecomposition {
  visualQuery: string;
  dataCriteria: Array<{
    field: string;
    operator: string;
    value: number;
  }>;
  reasoning: string;
}

// Simulate video upload
export const uploadVideo = async (file: File): Promise<{ success: boolean; filename: string; info: any }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        filename: file.name,
        info: {
          fps: 30,
          totalFrames: 9000,
          duration: 300,
          width: 1920,
          height: 1080,
        },
      });
    }, 1000);
  });
};

// Simulate CSV upload
export const uploadCsv = async (file: File): Promise<{ success: boolean; filename: string; info: any }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        filename: file.name,
        info: {
          rows: 10000,
          columns: ['timestamp', 'speed_kmh', 'acceleration_x_ms2', 'temperature_celsius'],
          columnCount: 4,
        },
      });
    }, 500);
  });
};

// Simulate tokenization
export const startTokenization = async (
  _skipFrames: number = 30,
  _maxFrames?: number
): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Tokenization started',
      });
    }, 500);
  });
};

// Simulate tokenization status polling
export const getTokenizationStatus = (): TokenizationStatus => {
  // In real implementation, this would poll the backend
  // For simulation, return a mock status
  return {
    status: 'complete',
    progress: 100,
    message: 'Tokenization complete! 300 frames processed',
    totalFrames: 300,
    processedFrames: 300,
  };
};

// Simulate system initialization
export const initializeSearchSystem = async (): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Search system initialized and ready',
      });
    }, 1000);
  });
};

// Simulate agentic search
export const performSearch = async (
  query: string,
  topK: number = 10
): Promise<{
  success: boolean;
  decomposition: QueryDecomposition;
  results: SearchResult[];
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate query decomposition
      const decomposition: QueryDecomposition = {
        visualQuery: extractVisualQuery(query),
        dataCriteria: extractDataCriteria(query),
        reasoning: `Visual: ${extractVisualQuery(query)}. Data filters: ${extractDataCriteria(query).length} criteria`,
      };

      // Generate mock results
      const results: SearchResult[] = [];
      for (let i = 0; i < Math.min(topK, 10); i++) {
        results.push({
          timestamp: Math.random() * 300,
          similarity: 0.9 - i * 0.05,
          dataValues: {
            speed_kmh: 50 + Math.random() * 50,
            acceleration_x_ms2: 5 + Math.random() * 10,
            temperature_celsius: 20 + Math.random() * 10,
          },
          matchedCriteria: decomposition.dataCriteria.map((c) => `${c.field} ${c.operator} ${c.value}`),
          visualQuery: decomposition.visualQuery,
        });
      }

      resolve({
        success: true,
        decomposition,
        results,
      });
    }, 1500);
  });
};

// Helper functions for query parsing
function extractVisualQuery(query: string): string {
  const visualKeywords = ['car', 'vehicle', 'person', 'object', 'robot', 'manufacturing', 'scene'];
  const words = query.toLowerCase().split(' ');
  for (const word of words) {
    if (visualKeywords.some((kw) => word.includes(kw))) {
      return word;
    }
  }
  return words[0] || 'scene';
}

function extractDataCriteria(query: string): Array<{ field: string; operator: string; value: number }> {
  const criteria: Array<{ field: string; operator: string; value: number }> = [];
  query.match(/\d+(?:\.\d+)?/g);

  if (query.includes('speed') || query.includes('kmph') || query.includes('kmh')) {
    const speedMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:kmph|kmh|kph)/i);
    if (speedMatch) {
      criteria.push({
        field: 'speed_kmh',
        operator: query.includes('over') || query.includes('more') ? '>=' : '==',
        value: parseFloat(speedMatch[1]),
      });
    }
  }

  if (query.includes('acceleration') || query.includes('accel')) {
    const accelMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:m\/s|ms)/i);
    if (accelMatch) {
      criteria.push({
        field: 'acceleration_x_ms2',
        operator: query.includes('over') || query.includes('more') ? '>=' : '==',
        value: parseFloat(accelMatch[1]),
      });
    }
  }

  if (query.includes('temperature') || query.includes('temp')) {
    const tempMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:celsius|c|fahrenheit|f)/i);
    if (tempMatch) {
      criteria.push({
        field: 'temperature_celsius',
        operator: query.includes('over') || query.includes('more') ? '>=' : '==',
        value: parseFloat(tempMatch[1]),
      });
    }
  }

  return criteria;
}

