import { Response } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';
import { AiService } from '../services/aiService';

export class ApplicationController {
  public static async apply(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const { jobId } = req.body;

      if (!jobId) {
        return res.status(400).json({ message: 'jobId is required.' });
      }

      const job = await db.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Target job opening not found.' });
      }

      // Check if already applied
      const existingApps = await db.getApplicationsForApplicant(req.user._id);
      const alreadyApplied = existingApps.some((a) => a.jobId === jobId);
      if (alreadyApplied) {
        return res.status(400).json({ message: 'You have already submitted an application for this role.' });
      }

      // Calculate AI match score & analysis
      const aiResult = await AiService.calculateMatch(req.user, job);

      const newApp = await db.createApplication({
        job: job._id,
        jobId: job._id,
        jobTitle: job.title,
        companyName: job.companyName,
        applicant: req.user._id,
        applicantId: req.user._id,
        applicantName: req.user.name,
        applicantEmail: req.user.email,
        applicantSkills: req.user.profile?.skills || [],
        employer: job.postedBy._id,
        employerId: job.postedBy._id,
        status: 'PENDING',
        aiMatchScore: aiResult.matchScore,
        aiMatchAnalysis: aiResult.analysis,
      });

      // Send notification to Employer
      await db.createNotification({
        recipient: job.postedBy._id,
        sender: {
          _id: req.user._id,
          name: req.user.name,
        },
        type: 'NEW_APPLICATION',
        title: 'New Candidate Application',
        message: `${req.user.name} applied for "${job.title}" (AI Match: ${aiResult.matchScore}%).`,
        link: '/employer/applicants',
      });

      // Send notification to Admin
      await db.createNotification({
        recipient: 'ADMIN_ALL',
        sender: {
          _id: req.user._id,
          name: req.user.name,
        },
        type: 'NEW_APPLICATION',
        title: 'Application Submitted',
        message: `${req.user.name} applied for "${job.title}" at ${job.companyName}.`,
        link: '/admin',
      });

      return res.status(201).json({
        application: newApp,
        aiMatch: aiResult,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error submitting application.' });
    }
  }

  public static async getEmployerApplications(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const { jobId } = req.query;
      const apps = await db.getApplicationsForEmployer(
        req.user._id,
        jobId ? String(jobId) : undefined
      );

      // Enhance with full applicant profile details
      const enrichedApps = await Promise.all(apps.map(async (app) => {
        const applicantUser = await db.findUserById(app.applicantId!);
        return {
          ...app,
          applicantDetails: applicantUser
            ? {
                _id: applicantUser._id,
                name: applicantUser.name,
                email: applicantUser.email,
                headline: applicantUser.profile?.headline,
                bio: applicantUser.profile?.bio,
                skills: applicantUser.profile?.skills || [],
                experience: applicantUser.profile?.experience || [],
                contactDetails: applicantUser.contactDetails,
                resumeText: applicantUser.profile?.resumeText,
              }
            : null,
        };
      }));

      return res.json({ applications: enrichedApps, count: enrichedApps.length });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching employer applications.' });
    }
  }

  public static async getEmployeeApplications(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const apps = await db.getApplicationsForApplicant(req.user._id);
      return res.json({ applications: apps, count: apps.length });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching candidate applications.' });
    }
  }

  public static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: 'status parameter is required.' });
      }

      const updated = await db.updateApplicationStatus(id, status);
      if (!updated) {
        return res.status(404).json({ message: 'Application record not found.' });
      }

      // Notify the applicant
      if (updated.applicantId) {
        await db.createNotification({
          recipient: updated.applicantId,
          sender: {
            _id: req.user!._id,
            name: req.user!.companyName || req.user!.name,
          },
          type: 'STATUS_CHANGE',
          title: 'Application Status Updated',
          message: `Your application status for "${updated.jobTitle}" was updated to ${status}.`,
          link: '/employee/dashboard',
        });
      }

      return res.json({ application: updated });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error updating application status.' });
    }
  }
}
