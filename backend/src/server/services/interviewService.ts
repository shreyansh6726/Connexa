import { GoogleGenAI } from '@google/genai';
import { InterviewEvaluation, InterviewSession, Job, User } from '../../types';

export class InterviewService {
  private static getAiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === 'paste-your-gemini-api-key-here') {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Generates welcoming opening greeting and tailored technical & behavioral interview questions
   */
  public static async generateInterviewPlan(
    candidate: Partial<User>,
    job: Partial<Job>
  ): Promise<{ greeting: string; questions: string[] }> {
    const ai = this.getAiClient();
    const candidateName = candidate.name || 'Candidate';
    const candidateSkills = (candidate.profile?.skills || []).join(', ') || 'General Software Engineering';
    const candidateBio = candidate.profile?.bio || candidate.profile?.headline || '';
    const jobTitle = job.title || 'Software Engineer';
    const company = job.companyName || 'Connexa Hiring Partner';
    const requirements = (job.requirements || []).join(', ') || 'Software Development';

    if (ai) {
      try {
        const prompt = `
You are an expert, professional, and friendly AI Technical Recruiter conducting a live technical and behavioral job interview for the position of "${jobTitle}" at "${company}".
The candidate's name is "${candidateName}".
Candidate's profile skills: ${candidateSkills}.
Candidate's bio/background: ${candidateBio}.
Target Job Requirements: ${requirements}.

Generate a welcoming greeting and exactly 5 targeted, high-quality interview questions designed specifically for this role and candidate background:
- Question 1: Warm introduction asking the candidate to introduce themselves and highlight their most relevant projects aligned with "${jobTitle}".
- Question 2: Technical question deeply focused on one or more core requirements (${requirements}).
- Question 3: System architecture, scenario-based problem solving, or practical coding design question.
- Question 4: Debugging, performance optimization, or handling edge cases in production.
- Question 5: Behavioral question about teamwork, tight deadlines, or technical disagreements.

Return STRICT JSON format only (no markdown, no backticks, just raw valid JSON):
{
  "greeting": "Welcome message to the candidate introducing yourself as Connexa AI Interviewer and setting a positive tone.",
  "questions": [
    "Question 1 text...",
    "Question 2 text...",
    "Question 3 text...",
    "Question 4 text...",
    "Question 5 text..."
  ]
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim() || '';
        const cleaned = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.greeting && Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
          return {
            greeting: parsed.greeting,
            questions: parsed.questions.slice(0, 5),
          };
        }
      } catch (err: any) {
        console.warn('Gemini API call failed or timed out, falling back to rule-based generator:', err.message);
      }
    }

    // High quality intelligent fallback if GEMINI_API_KEY is not configured yet
    const primarySkill = (job.requirements && job.requirements[0]) || 'full-stack development';
    const secondarySkill = (job.requirements && job.requirements[1]) || 'system architecture';

    return {
      greeting: `Hello ${candidateName}! Welcome to your live AI interview for the ${jobTitle} position at ${company}. I am Connexa's AI Interviewer. I'll guide you through 5 targeted questions to evaluate your technical skills and experience. Relax, speak naturally, and give as much detail as you'd like!`,
      questions: [
        `Could you briefly introduce yourself, highlight your background with ${candidateSkills}, and share what excites you most about this ${jobTitle} role?`,
        `Given the requirements for this position, how have you utilized ${primarySkill} in your past projects to solve complex technical challenges?`,
        `Suppose you are building a critical service that experiences unexpected latency spikes or high load. How would you design and optimize the architecture using ${secondarySkill}?`,
        `Describe a challenging bug or performance bottleneck you encountered in production. How did you identify the root cause, and what steps did you take to resolve it?`,
        `How do you handle technical disagreements or scope changes within an agile team when working against tight delivery deadlines?`,
      ],
    };
  }

  /**
   * Evaluates the candidate's answer and gives immediate constructive feedback
   */
  public static async evaluateAnswer(
    question: string,
    answer: string,
    job: Partial<Job>
  ): Promise<{ feedback: string; score: number }> {
    const ai = this.getAiClient();

    if (ai && answer.length > 15) {
      try {
        const prompt = `
You are evaluating a candidate's live answer in a job interview.
Job Title: ${job.title}
Interview Question: "${question}"
Candidate Answer: "${answer}"

Evaluate the answer based on technical depth, clarity, relevance, and problem-solving capability.
Return STRICT JSON format only (no markdown, no backticks, just raw JSON):
{
  "score": <number between 40 and 100>,
  "feedback": "<1-2 sentences of encouraging, professional interviewer response acknowledging key points and smoothly transitioning>"
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim() || '';
        const cleaned = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
          score: Math.min(100, Math.max(30, Number(parsed.score) || 75)),
          feedback: parsed.feedback || 'Thank you for explaining that clearly. Let us move to the next topic.',
        };
      } catch (err: any) {
        console.warn('Gemini evaluateAnswer fallback:', err.message);
      }
    }

    // Fallback evaluation heuristic
    const wordCount = answer.trim().split(/\s+/).length;
    let score = 70;
    let feedback = 'Thank you for your answer. Let us proceed to the next question.';

    if (wordCount > 40) {
      score = 88;
      feedback = 'Excellent and detailed explanation covering the key concepts thoroughly.';
    } else if (wordCount > 15) {
      score = 78;
      feedback = 'Good answer with clear communication and relevant examples.';
    } else {
      score = 60;
      feedback = 'A concise response. In upcoming questions, feel free to elaborate with specific past experiences.';
    }

    return { score, feedback };
  }

  /**
   * Comprehensive evaluation of the entire interview session
   */
  public static async generateFinalEvaluation(
    interview: InterviewSession,
    job: Partial<Job>
  ): Promise<InterviewEvaluation> {
    const ai = this.getAiClient();

    const conversationTranscript = interview.messages
      .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n\n');

    if (ai) {
      try {
        const prompt = `
You are a Lead Hiring Manager & AI Technical Assessor.
Review the following complete live technical interview transcript for the role of "${job.title}" at "${job.companyName}".
Candidate Name: ${interview.candidateName}

--- INTERVIEW TRANSCRIPT ---
${conversationTranscript}
----------------------------

Provide a comprehensive, objective, and fair candidate assessment.
Return STRICT JSON only (no markdown, no backticks):
{
  "overallScore": <integer 0-100>,
  "technicalScore": <integer 0-100>,
  "communicationScore": <integer 0-100>,
  "problemSolvingScore": <integer 0-100>,
  "summary": "<2-3 sentences summarizing candidate's overall fit and readiness for ${job.title}>",
  "strengths": [
    "<Key strength 1>",
    "<Key strength 2>",
    "<Key strength 3>"
  ],
  "areasForImprovement": [
    "<Constructive recommendation 1>",
    "<Constructive recommendation 2>"
  ],
  "hiringRecommendation": "<One of: STRONG_HIRE, HIRE, CONSIDER, NO_HIRE>"
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim() || '';
        const cleaned = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        return {
          overallScore: Math.min(100, Math.max(30, Number(parsed.overallScore) || 80)),
          technicalScore: Math.min(100, Math.max(30, Number(parsed.technicalScore) || 82)),
          communicationScore: Math.min(100, Math.max(30, Number(parsed.communicationScore) || 85)),
          problemSolvingScore: Math.min(100, Math.max(30, Number(parsed.problemSolvingScore) || 78)),
          summary: parsed.summary || `${interview.candidateName} showed solid technical competence and good communication for ${job.title}.`,
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4) : ['Clear communication', 'Relevant technical skills'],
          areasForImprovement: Array.isArray(parsed.areasForImprovement) ? parsed.areasForImprovement.slice(0, 3) : ['Provide more depth on distributed edge cases'],
          hiringRecommendation: ['STRONG_HIRE', 'HIRE', 'CONSIDER', 'NO_HIRE'].includes(parsed.hiringRecommendation)
            ? parsed.hiringRecommendation
            : 'HIRE',
        };
      } catch (err: any) {
        console.warn('Gemini generateFinalEvaluation fallback:', err.message);
      }
    }

    // Intelligent fallback calculation based on message scores & response depths
    const candidateAnswers = interview.messages.filter((m) => m.sender === 'candidate');
    const answerScores = candidateAnswers.map((a) => a.score || 75);
    const avgScore = answerScores.length > 0
      ? Math.round(answerScores.reduce((acc, curr) => acc + curr, 0) / answerScores.length)
      : 80;

    const technicalScore = Math.min(98, Math.max(50, avgScore + 2));
    const communicationScore = Math.min(95, Math.max(55, avgScore + 4));
    const problemSolvingScore = Math.min(94, Math.max(50, avgScore - 2));
    const overallScore = Math.round((technicalScore * 0.4) + (communicationScore * 0.3) + (problemSolvingScore * 0.3));

    let hiringRecommendation: InterviewEvaluation['hiringRecommendation'] = 'HIRE';
    if (overallScore >= 88) hiringRecommendation = 'STRONG_HIRE';
    else if (overallScore >= 72) hiringRecommendation = 'HIRE';
    else if (overallScore >= 60) hiringRecommendation = 'CONSIDER';
    else hiringRecommendation = 'NO_HIRE';

    return {
      overallScore,
      technicalScore,
      communicationScore,
      problemSolvingScore,
      summary: `${interview.candidateName} completed the live technical interview for ${job.title}. Demonstrated strong understanding of core concepts, effective problem breakdown, and articulate communication.`,
      strengths: [
        'Direct alignment on required tech stack and tooling',
        'Structured, systematic approach to architectural problem solving',
        'Strong communication clarity and conversational demeanor',
      ],
      areasForImprovement: [
        'Could include more concrete production metrics and throughput numbers',
        'Consider elaborating on disaster recovery and failover scenarios',
      ],
      hiringRecommendation,
    };
  }
}
