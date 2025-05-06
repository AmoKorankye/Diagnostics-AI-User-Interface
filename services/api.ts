const API_URL = 'http://localhost:5000'; // Replace with your Flask server URL

export const submitScanResults = async (data: {
  receiver_emails: string[];
  subject?: string;
  description?: string;
  scan_type?: string;
  diagnosis_area?: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/submit-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting scan results:', error);
    throw error;
  }
};
