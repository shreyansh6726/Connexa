import { Response } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';
import { InterviewService } from '../services/interviewService';
import { InterviewMessage, InterviewSession } from '../../types';

export class InterviewController {
  /**
   * Start a new live AI interview for a specific job requisition
   */
  public static async startInterview(req: AuthRequest, res: Response) {
    try {
      const { jobId, applicationId } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      if (!jobId) {
        return res.status(400).json({ message: 'jobId is required to start an interview.' });
      }

      const job = await db.getJobById(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found.' });
      }

      // Generate customized questions & welcoming greeting using Gemini
      const { greeting, questions } = await InterviewService.generateInterviewPlan(user, job);

      const interviewId = `int-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const firstQuestion = questions[0];

      const initialMessage: InterviewMessage = {
        id: `msg-${Date.now()}-ai-0`,
        sender: 'ai',
        text: `${greeting}\n\nQuestion 1 of ${questions.length}: ${firstQuestion}`,
        timestamp: new Date().toISOString(),
      };

      const newInterview: InterviewSession = {
        _id: interviewId,
        candidateId: user._id,
        candidateName: user.name,
        candidateEmail: user.email,
        jobId: job._id,
        jobTitle: job.title,
        companyName: job.companyName,
        applicationId: applicationId || undefined,
        status: 'IN_PROGRESS',
        currentQuestionIndex: 0,
        totalQuestions: questions.length,
        questions,
        messages: [initialMessage],
        createdAt: new Date().toISOString(),
      };

      await db.createInterview(newInterview);

      return res.status(201).json({
        interview: newInterview,
        greeting,
        firstQuestion,
        totalQuestions: questions.length,
      });
    } catch (err: any) {
      console.error('Error starting live interview:', err);
      return res.status(500).json({ message: err.message || 'Error initializing live interview session.' });
    }
  }

  /**
   * Submit candidate's live answer to the current question
   */
  public static async submitAnswer(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { answerText } = req.body;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      if (!answerText || !answerText.trim()) {
        return res.status(400).json({ message: 'Answer text is required.' });
      }

      const interview = await db.getInterviewById(id);
      if (!interview) {
        return res.status(404).json({ message: 'Interview session not found.' });
      }

      if (interview.candidateId !== user._id && user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'You are not authorized to respond to this interview.' });
      }

      if (interview.status !== 'IN_PROGRESS') {
        return res.status(400).json({ message: 'This interview session has already ended.' });
      }

      const job = await db.getJobById(interview.jobId);
      const currentQuestion = interview.questions[interview.currentQuestionIndex];

      // Instant evaluation and score of the candidate's answer
      const { feedback, score } = await InterviewService.evaluateAnswer(
        currentQuestion,
        answerText.trim(),
        job || { title: interview.jobTitle }
      );

      const candidateMsg: InterviewMessage = {
        id: `msg-${Date.now()}-cand`,
        sender: 'candidate',
        text: answerText.trim(),
        score,
        feedback,
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...interview.messages, candidateMsg];
      const nextIndex = interview.currentQuestionIndex + 1;

      // Check if more questions remain
      if (nextIndex < interview.totalQuestions) {
        const nextQuestionText = interview.questions[nextIndex];
        const aiFollowUpMsg: InterviewMessage = {
          id: `msg-${Date.now()}-ai-${nextIndex}`,
          sender: 'ai',
          text: `${feedback}\n\nQuestion ${nextIndex + 1} of ${interview.totalQuestions}: ${nextQuestionText}`,
          timestamp: new Date().toISOString(),
        };

        updatedMessages.push(aiFollowUpMsg);

        const updated = await db.updateInterview(id, {
          messages: updatedMessages,
          currentQuestionIndex: nextIndex,
        });

        return res.json({
          isComplete: false,
          currentQuestionIndex: nextIndex,
          totalQuestions: interview.totalQuestions,
          nextQuestion: nextQuestionText,
          feedback,
          score,
          interview: updated,
        });
      } else {
        // Interview finished! Generate comprehensive final evaluation
        interview.messages = updatedMessages;
        const evaluation = await InterviewService.generateFinalEvaluation(
          interview,
          job || { title: interview.jobTitle, companyName: interview.companyName }
        );

        const concludingMsg: InterviewMessage = {
          id: `msg-${Date.now()}-ai-final`,
          sender: 'ai',
          text: `Thank you, ${interview.candidateName}! You have successfully completed all interview questions. I have generated your technical evaluation report and overall interview score of ${evaluation.overallScore}/100.`,
          timestamp: new Date().toISOString(),
        };

        updatedMessages.push(concludingMsg);

        const updated = await db.updateInterview(id, {
          status: 'COMPLETED',
          messages: updatedMessages,
          evaluation,
          completedAt: new Date().toISOString(),
        });

        // Link with application if provided
        if (interview.applicationId) {
          await db.updateApplication(interview.applicationId, {
            interviewId: interview._id,
            interviewScore: evaluation.overallScore,
            interviewRecommendation: evaluation.hiringRecommendation,
          });

          // Notify hiring employer
          if (job?.postedBy?._id) {
            await db.createNotification({
              recipient: job.postedBy._id,
              sender: { _id: user._id, name: user.name },
              type: 'STATUS_CHANGE',
              title: 'Live AI Interview Completed',
              message: `${user.name} completed the live AI interview for "${interview.jobTitle}" with an overall score of ${evaluation.overallScore}%.`,
              link: `/employer/applicants?jobId=${job._id}`,
            });
          }
        }

        return res.json({
          isComplete: true,
          currentQuestionIndex: interview.totalQuestions,
          totalQuestions: interview.totalQuestions,
          evaluation,
          interview: updated,
        });
      }
    } catch (err: any) {
      console.error('Error submitting interview answer:', err);
      return res.status(500).json({ message: err.message || 'Error processing interview response.' });
    }
  }

  /**
   * Get single interview session by ID
   */
  public static async getInterview(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const interview = await db.getInterviewById(id);
      if (!interview) {
        return res.status(404).json({ message: 'Interview session not found.' });
      }

      // Authorization check
      if (
        interview.candidateId !== user._id &&
        user.role !== 'EMPLOYER' &&
        user.role !== 'ADMIN'
      ) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      return res.json({ interview });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error retrieving interview.' });
    }
  }

  /**
   * Get all interviews for current logged in candidate
   */
  public static async getMyInterviews(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const interviews = await db.getInterviewsByCandidate(user._id);
      return res.json({ interviews });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error retrieving candidate interviews.' });
    }
  }

  /**
   * Get interview session linked to a job application (for employer viewing)
   */
  public static async getApplicationInterview(req: AuthRequest, res: Response) {
    try {
      const { applicationId } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ message: 'Authentication required.' });
      }

      const interview = await db.getInterviewByApplication(applicationId);
      if (!interview) {
        return res.status(404).json({ message: 'No interview recorded for this application.' });
      }

      return res.json({ interview });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching application interview.' });
    }
  }
}
