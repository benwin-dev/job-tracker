import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
import JobApplication from '@/models/JobApplication';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { companyId, title, location, status } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const application = new JobApplication({
      title: title.trim(),
      location: location?.trim() || '',
      status: status?.trim() || '',
    });

    await application.save();

    company.applications.push(application._id);
    await company.save();

    return NextResponse.json({
      id: application._id.toString(),
      title: application.title,
      location: application.location,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { companyId, applicationId, title, location, status } = body;

    if (!companyId || !applicationId) {
      return NextResponse.json(
        { error: 'Company ID and Application ID are required' },
        { status: 400 }
      );
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (!company.applications.includes(applicationId as any)) {
      return NextResponse.json(
        { error: 'Application not found in this company' },
        { status: 404 }
      );
    }

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        title: title?.trim() || '',
        location: location?.trim() || '',
        status: status?.trim() || '',
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: application._id.toString(),
      title: application.title,
      location: application.location,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const applicationId = searchParams.get('applicationId');

    if (!companyId || !applicationId) {
      return NextResponse.json(
        { error: 'Company ID and Application ID are required' },
        { status: 400 }
      );
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Remove application from company's applications array
    company.applications = company.applications.filter(
      (id: any) => id.toString() !== applicationId
    );
    await company.save();

    // Delete the application
    await JobApplication.findByIdAndDelete(applicationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}

