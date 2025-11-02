import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Company from '@/models/Company';
import JobApplication from '@/models/JobApplication';

export async function GET() {
  try {
    await connectDB();
    const companies = await Company.find({})
      .populate('applications')
      .sort({ createdAt: -1 })
      .lean();
    
    // Convert to JSON format with proper date strings
    const companiesJson = companies.map((company: any) => ({
      id: company._id.toString(),
      name: company.name,
      applications: (company.applications || []).map((app: any) => ({
        id: app._id.toString(),
        title: app.title,
        location: app.location || '',
        status: app.status || '',
        createdAt: app.createdAt ? app.createdAt.toISOString() : new Date().toISOString(),
      })),
      createdAt: company.createdAt ? company.createdAt.toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json(companiesJson);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const company = new Company({
      name: name.trim(),
      applications: [],
    });

    await company.save();

    return NextResponse.json({
      id: company._id.toString(),
      name: company.name,
      applications: [],
      createdAt: company.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const company = await Company.findById(id);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Delete all associated applications
    await JobApplication.deleteMany({ _id: { $in: company.applications } });
    
    // Delete the company
    await Company.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  }
}

