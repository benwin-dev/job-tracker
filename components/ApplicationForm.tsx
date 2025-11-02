'use client';

import { useState, useEffect } from 'react';
import { JobApplication } from '@/types';
import { addApplicationToCompany, updateApplication } from '@/lib/storage';

interface ApplicationFormProps {
  companyId: string;
  application?: JobApplication;
  onSave: () => void;
  onCancel: () => void;
}

export default function ApplicationForm({
  companyId,
  application,
  onSave,
  onCancel,
}: ApplicationFormProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (application) {
      setTitle(application.title);
      setLocation(application.location);
      setStatus(application.status);
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title/role');
      return;
    }

    setIsSubmitting(true);
    let result;
    if (application) {
      // Update existing
      result = await updateApplication(companyId, application.id, {
        title: title.trim(),
        location: location.trim(),
        status: status.trim(),
      });
    } else {
      // Create new
      result = await addApplicationToCompany(companyId, {
        title: title.trim(),
        location: location.trim(),
        status: status.trim(),
      });
    }

    if (result) {
      onSave();
    } else {
      alert(`Failed to ${application ? 'update' : 'create'} application. Please try again.`);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title/Role *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Software Engineer"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., San Francisco, CA or Remote"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status
        </label>
        <textarea
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Enter status, notes, or updates..."
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (application ? 'Updating...' : 'Adding...') : (application ? 'Update' : 'Add')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

