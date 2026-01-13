const API_BASE = '/api';

export const searchSubjects = async (query) => {
    if (!query) return [];
    const response = await fetch(`${API_BASE}/subjects/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

export const getSubjectClasses = async (subjectId) => {
    const response = await fetch(`${API_BASE}/subjects/${subjectId}/classes`);
    if (!response.ok) {
        throw new Error('Failed to fetch classes');
    }
    return response.json();
};

export const generateSchedule = async (payload) => {
    const response = await fetch(`${API_BASE}/generate/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Generation failed');
    }
    return response.json();
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/import/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Upload failed');
    }
    return response.json();
};
