'use client';

import { Company } from '@/types';
import { formatDate, getRelativeTime } from '@/lib/utils';
import { deleteApplication } from '@/lib/storage';
import { useState } from 'react';
import ApplicationForm from './ApplicationForm';

interface TimelineViewProps {
  companies: Company[];
  onUpdate: () => void;
}

interface GroupedApplication {
  date: string;
  applications: Array<{
    application: Company['applications'][0];
    companyName: string;
    companyId: string;
  }>;
}

export default function TimelineView({ companies, onUpdate }: TimelineViewProps) {
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);

  // Group applications by date
  const groupedApplications: GroupedApplication[] = [];
  const dateMap = new Map<string, GroupedApplication>();

  companies.forEach((company) => {
    company.applications.forEach((app) => {
      const date = new Date(app.createdAt).toDateString();
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          applications: [],
        });
      }
      
      dateMap.get(date)!.applications.push({
        application: app,
        companyName: company.name,
        companyId: company.id,
      });
    });
  });

  // Sort by date (newest first) and sort applications within each day
  Array.from(dateMap.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .forEach((group) => {
      group.applications.sort(
        (a, b) =>
          new Date(b.application.createdAt).getTime() -
          new Date(a.application.createdAt).getTime()
      );
      groupedApplications.push(group);
    });

  if (groupedApplications.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          No applications yet. Add some applications to see them in timeline view!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedApplications.map((group) => {
        const groupDate = new Date(group.date);
        const isToday = groupDate.toDateString() === new Date().toDateString();
        const isYesterday =
          groupDate.toDateString() ===
          new Date(Date.now() - 86400000).toDateString();

        let dateLabel = formatDate(group.date);
        if (isToday) dateLabel = 'Today';
        else if (isYesterday) dateLabel = 'Yesterday';

        return (
          <div key={group.date} className="relative">
            {/* Date header */}
            <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 py-3 px-4 border-b border-gray-200 dark:border-gray-700 mb-4 rounded-t-lg">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {dateLabel}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {group.applications.length}{' '}
                {group.applications.length === 1 ? 'application' : 'applications'}
              </p>
            </div>

            {/* Timeline line */}
            <div className="absolute left-4 top-16 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

            {/* Applications */}
            <div className="space-y-4 pl-8">
              {group.applications.map(({ application, companyName, companyId }) => (
                <div
                  key={application.id}
                  className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-11 top-4 w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-full border-2 border-white dark:border-gray-900"></div>

                  <div className="p-4">
                    {editingAppId === application.id &&
                    editingCompanyId === companyId ? (
                      <ApplicationForm
                        companyId={companyId}
                        application={application}
                        onSave={() => {
                          setEditingAppId(null);
                          setEditingCompanyId(null);
                          onUpdate();
                        }}
                        onCancel={() => {
                          setEditingAppId(null);
                          setEditingCompanyId(null);
                        }}
                      />
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {application.title}
                              </h4>
                              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                {companyName}
                              </span>
                            </div>
                            {application.location && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                📍 {application.location}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingAppId(application.id);
                                setEditingCompanyId(companyId);
                              }}
                              className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Delete this application?')) {
                                  const success = await deleteApplication(
                                    companyId,
                                    application.id
                                  );
                                  if (success) {
                                    onUpdate();
                                  } else {
                                    alert(
                                      'Failed to delete application. Please try again.'
                                    );
                                  }
                                }
                              }}
                              className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {application.status && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              Status:
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {application.status}
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                          Added {formatDate(application.createdAt)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

