/**
 * API service for communicating with the backend server
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Interface for scan submission data
 */
interface ScanSubmissionData {
  receiver_emails: string[];
  subject?: string;
  description?: string;
  scan_type?: string;
  diagnosis_area?: string;
  pdf_data?: string;
  pdf_id?: string;
}

/**
 * Submit scan results to the backend for email sharing
 * 
 * @param data The scan submission data
 * @returns Response from the server
 */
export async function submitScanResults(data: ScanSubmissionData) {
  try {
    const response = await fetch(`${API_BASE_URL}/submit-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting scan results:', error);
    return {
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Process an image for diagnosis
 * 
 * @param imageData Base64 encoded image data
 * @param diagnosisArea Diagnosis area type
 * @returns Diagnosis result from the AI model
 */
export async function processImage(imageData: string, diagnosisArea: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/process-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        diagnosisArea: diagnosisArea
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error processing image:', error);
    return {
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Upload a PDF file to the server
 * 
 * @param pdfData Base64 encoded PDF data
 * @param filename Optional filename
 * @returns Response with PDF ID for later reference
 */
export async function uploadPdf(pdfData: string, filename?: string) {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdf_data: pdfData,
        filename: filename
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Server responded with status: ${response.status}. Details: ${errorBody}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading PDF:', error);
    
    // Provide more detailed error messages
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        status: 'failure',
        message: 'Request timed out. The server took too long to respond.'
      };
    }
    
    return {
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
