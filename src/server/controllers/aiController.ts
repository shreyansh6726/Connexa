import { Response } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';
import { AiService } from '../services/aiService';

export class AiController {
  public static async calculateMatch(req: AuthRequest, res: Response) {
    try {
      const { candidateId, jobId, candidateData, jobData } = req.body;

      let candidate = candidateData;
      if (!candidate && candidateId) {
        candidate = await db.findUserById(candidateId);
      } else if (!candidate && req.user) {
        candidate = req.user;
      }

      let job = jobData;
      if (!job && jobId) {
        job = await db.getJobById(jobId);
      }

      if (!candidate || !job) {
        return res.status(400).json({ message: 'Candidate profile and job description are required for AI matching.' });
      }

      const result = await AiService.calculateMatch(candidate, job);
      return res.json({ result });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error processing AI match algorithm.' });
    }
  }

  public static async generateBio(req: AuthRequest, res: Response) {
    try {
      const { name, targetRole, currentSkills, yearsOfExperience } = req.body;

      const userName = name || req.user?.name || 'Professional Candidate';
      const skills = Array.isArray(currentSkills) ? currentSkills : req.user?.profile?.skills || [];

      const result = await AiService.generateBio({
        name: userName,
        targetRole,
        currentSkills: skills,
        yearsOfExperience,
      });

      return res.json({ result });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error generating AI profile bio.' });
    }
  }

  public static async enhanceJob(req: AuthRequest, res: Response) {
    try {
      const { title, rawDescription, companyName } = req.body;

      if (!title || !rawDescription) {
        return res.status(400).json({ message: 'Job title and raw description are required.' });
      }

      const result = await AiService.enhanceJobDescription({
        title,
        rawDescription,
        companyName: companyName || req.user?.companyName,
      });

      return res.json({ result });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error enhancing job description.' });
    }
  }
}
