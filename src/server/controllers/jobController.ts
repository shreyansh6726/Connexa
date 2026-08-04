import { Response } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

export class JobController {
  public static async getJobs(req: AuthRequest, res: Response) {
    try {
      const { keyword, location, jobType, postedBy, status } = req.query;

      const jobs = await db.getJobs({
        keyword: keyword ? String(keyword) : undefined,
        location: location ? String(location) : undefined,
        jobType: jobType ? String(jobType) : undefined,
        postedBy: postedBy ? String(postedBy) : undefined,
        status: status ? String(status) : 'OPEN',
      });

      return res.json({ jobs, count: jobs.length });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching jobs.' });
    }
  }

  public static async getJobById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const job = await db.getJobById(id);

      if (!job) {
        return res.status(404).json({ message: 'Job posting not found.' });
      }

      return res.json({ job });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching job.' });
    }
  }

  public static async createJob(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const { title, companyName, location, jobType, salaryRange, description, requirements, keywords } = req.body;

      if (!title || !description) {
        return res.status(400).json({ message: 'Title and description are required.' });
      }

      const newJob = await db.createJob(
        {
          title,
          companyName: companyName || req.user.companyName || req.user.name,
          location: location || 'Remote',
          jobType: jobType || 'FULL_TIME',
          salaryRange: salaryRange || { min: 90000, max: 130000, currency: 'USD' },
          description,
          requirements: Array.isArray(requirements) ? requirements : [],
          keywords: Array.isArray(keywords) ? keywords : [],
        },
        req.user
      );

      // Trigger Notification for Admin
      await db.createNotification({
        recipient: 'ADMIN_ALL',
        sender: {
          _id: req.user._id,
          name: `${req.user.name} (${newJob.companyName})`,
        },
        type: 'NEW_JOB_POSTED',
        title: 'New Job Listing Posted',
        message: `${newJob.companyName} posted a new position: "${newJob.title}".`,
        link: '/admin',
      });

      return res.status(201).json({ job: newJob });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error creating job.' });
    }
  }

  public static async updateJob(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const job = await db.getJobById(id);

      if (!job) {
        return res.status(404).json({ message: 'Job not found.' });
      }

      // Check ownership or admin
      if (req.user?.role !== 'ADMIN' && job.postedBy._id !== req.user?._id) {
        return res.status(403).json({ message: 'Unauthorized to edit this job posting.' });
      }

      const updated = await db.updateJob(id, req.body);
      return res.json({ job: updated });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error updating job.' });
    }
  }

  public static async getCandidates(req: AuthRequest, res: Response) {
    try {
      const { keyword, skill } = req.query;
      const candidates = await db.getAllEmployees(
        keyword ? String(keyword) : undefined,
        skill ? String(skill) : undefined
      );

      return res.json({ candidates, count: candidates.length });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error searching candidate profiles.' });
    }
  }
}
