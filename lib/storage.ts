import { Company } from '@/types';

const API_BASE = '/api';

export async function getCompanies(): Promise<Company[]> {
  try {
    const response = await fetch(`${API_BASE}/companies`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

export async function addCompany(company: Omit<Company, 'id' | 'createdAt'>): Promise<Company | null> {
  try {
    const response = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: company.name,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create company');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating company:', error);
    return null;
  }
}

export async function deleteCompany(companyId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/companies?id=${encodeURIComponent(companyId)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete company');
    }
    return true;
  } catch (error) {
    console.error('Error deleting company:', error);
    return false;
  }
}

export async function addApplicationToCompany(
  companyId: string,
  application: Omit<Company['applications'][0], 'id' | 'createdAt'>
): Promise<Company['applications'][0] | null> {
  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId,
        title: application.title,
        location: application.location,
        status: application.status,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create application');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating application:', error);
    return null;
  }
}

export async function updateApplication(
  companyId: string,
  applicationId: string,
  updates: Partial<Omit<Company['applications'][0], 'id' | 'createdAt'>>
): Promise<Company['applications'][0] | null> {
  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId,
        applicationId,
        ...updates,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to update application');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating application:', error);
    return null;
  }
}

export async function deleteApplication(companyId: string, applicationId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE}/applications?companyId=${encodeURIComponent(companyId)}&applicationId=${encodeURIComponent(applicationId)}`,
      {
        method: 'DELETE',
      }
    );
    if (!response.ok) {
      throw new Error('Failed to delete application');
    }
    return true;
  } catch (error) {
    console.error('Error deleting application:', error);
    return false;
  }
}
