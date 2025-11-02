'use client';

import { useState, useEffect } from 'react';
import { Company, TimeFilter } from '@/types';
import { getCompanies, deleteCompany } from '@/lib/storage';
import { filterCompaniesByTime } from '@/lib/utils';
import CompanyCard from '@/components/CompanyCard';
import CompanyForm from '@/components/CompanyForm';

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    const filtered = filterCompaniesByTime(companies, timeFilter);
    // Sort by creation date, newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredCompanies(filtered);
  }, [companies, timeFilter]);

  const loadCompanies = async () => {
    const data = await getCompanies();
    setCompanies(data);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (confirm('Are you sure you want to delete this company and all its applications?')) {
      const success = await deleteCompany(companyId);
      if (success) {
        await loadCompanies();
      } else {
        alert('Failed to delete company. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Job Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your job applications by company
          </p>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by time:
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="older">Older</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
          >
            {showAddForm ? 'Cancel' : '+ Add Company'}
          </button>
        </div>

        {showAddForm && (
          <div className="mb-6">
            <CompanyForm
              onSave={() => {
                setShowAddForm(false);
                loadCompanies();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              {companies.length === 0
                ? 'No companies yet. Add your first company to get started!'
                : 'No companies match the selected time filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onUpdate={loadCompanies}
                onDelete={() => handleDeleteCompany(company.id)}
              />
            ))}
          </div>
        )}

        {companies.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Total: {companies.length} {companies.length === 1 ? 'company' : 'companies'} •{' '}
            {companies.reduce((sum, c) => sum + c.applications.length, 0)}{' '}
            {companies.reduce((sum, c) => sum + c.applications.length, 0) === 1
              ? 'application'
              : 'applications'}
          </div>
        )}
      </div>
    </div>
  );
}
