'use client';

import { Company } from '@/types';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { deleteApplication } from '@/lib/storage';
import { useState } from 'react';
import ApplicationForm from './ApplicationForm';

interface CompanyCardProps {
  company: Company;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function CompanyCard({ company, onUpdate, onDelete }: CompanyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {company.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {company.applications.length} {company.applications.length === 1 ? 'application' : 'applications'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Created {getRelativeTime(company.createdAt)}
            </p>
          </div>
          <div className="ml-4 flex gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            {company.applications.length > 0 && (
              <div className="space-y-3">
                {company.applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {editingAppId === app.id ? (
                      <ApplicationForm
                        companyId={company.id}
                        application={app}
                        onSave={() => {
                          setEditingAppId(null);
                          onUpdate();
                        }}
                        onCancel={() => setEditingAppId(null)}
                      />
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {app.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              📍 {app.location}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingAppId(app.id)}
                              className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Delete this application?')) {
                                  const success = await deleteApplication(company.id, app.id);
                                  if (success) {
                                    onUpdate();
                                  } else {
                                    alert('Failed to delete application. Please try again.');
                                  }
                                }
                              }}
                              className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Status:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                            {app.status || 'No status'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          Added {formatDate(app.createdAt)}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showAddForm ? (
              <ApplicationForm
                companyId={company.id}
                onSave={() => {
                  setShowAddForm(false);
                  onUpdate();
                }}
                onCancel={() => setShowAddForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                + Add Role/Application
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

