import React from 'react';
import { Card, Space, Divider } from 'antd';
import CVAccessButton from '../components/CVAccessButton';
import HRCVViewer from '../components/HRCVViewer';
import { cvApi } from '../lib/cvApi';

// Example: How to integrate HR CV access into your existing components

// 1. Simple button integration for applicant lists
export const ApplicantCardWithCVAccess = ({ applicant, hrId }: { applicant: any; hrId: number }) => {
  return (
    <Card
      title={applicant.name}
      extra={
        <Space>
          <CVAccessButton
            cvId={applicant.cvId}
            candidateUserId={applicant.userId}
            hrId={hrId}
            candidateName={applicant.name}
            size="small"
          />
        </Space>
      }
    >
      <p>Email: {applicant.email}</p>
      <p>Position: {applicant.position}</p>
      <p>Applied: {applicant.appliedDate}</p>
    </Card>
  );
};

// 2. Full CV viewer integration for detailed candidate view
export const CandidateDetailWithCV = ({ candidate, hrId }: { candidate: any; hrId: number }) => {
  return (
    <div>
      <Card title="Candidate Information">
        <p><strong>Name:</strong> {candidate.name}</p>
        <p><strong>Email:</strong> {candidate.email}</p>
        <p><strong>Phone:</strong> {candidate.phone}</p>
        <p><strong>Experience:</strong> {candidate.experience}</p>
      </Card>
      
      <Divider />
      
      <Card title="CV Access">
        <HRCVViewer
          cvId={candidate.cvId}
          candidateUserId={candidate.userId}
          hrId={hrId}
          candidateName={candidate.name}
        />
      </Card>
    </div>
  );
};

// 3. Usage in job application management
export const JobApplicationManager = ({ applications, hrId }: { applications: any[]; hrId: number }) => {
  return (
    <div>
      <h2>Job Applications</h2>
      {applications.map((app) => (
        <Card key={app.id} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>{app.candidateName}</h3>
              <p>Applied for: {app.jobTitle}</p>
              <p>Status: {app.status}</p>
            </div>
            <Space>
              <CVAccessButton
                cvId={app.cvId}
                candidateUserId={app.candidateUserId}
                hrId={hrId}
                candidateName={app.candidateName}
                buttonText="Review CV"
              />
            </Space>
          </div>
        </Card>
      ))}
    </div>
  );
};

// 4. API usage examples
export const CVAccessExamples = {
  // Generate HR token for secure access
  generateHRAccess: async (cvId: number, hrId: number, candidateUserId: number) => {
    try {
      const result = await cvApi.generateHRToken(cvId, hrId, candidateUserId);
      console.log('HR access generated:', result);
      // result.fullUrl contains: http://localhost:8080/uploads/cv/filename.pdf?viewerId=2&embed=true&token=...
      return result;
    } catch (error) {
      console.error('Failed to generate HR access:', error);
      throw error;
    }
  },

  // Generate embed token for in-app viewing
  generateEmbedAccess: async (cvId: number, viewerId: number, accessType: 'OWNER' | 'HR') => {
    try {
      const result = await cvApi.generateEmbedToken(cvId, viewerId, accessType);
      console.log('Embed access generated:', result);
      return result;
    } catch (error) {
      console.error('Failed to generate embed access:', error);
      throw error;
    }
  },

  // Build secure URL manually
  buildSecureUrl: (filename: string, viewerId: number, token?: string) => {
    return cvApi.buildSecureCVUrl(filename, viewerId, token, true);
  }
};

export default {
  ApplicantCardWithCVAccess,
  CandidateDetailWithCV,
  JobApplicationManager,
  CVAccessExamples
};