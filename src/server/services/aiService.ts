import { AiMatchResult, BioGenerationResult, EnhanceJobResult, Job, User } from '../../types';

export class AiService {
  /**
   * Calculate AI Match Score between a candidate and a job opening.
   */
  public static async calculateMatch(candidate: Partial<User>, job: Partial<Job>): Promise<AiMatchResult> {
    const candidateSkills = (candidate.profile?.skills || []).map((s) => s.trim().toLowerCase());
    const jobRequirements = (job.requirements || []).map((r) => r.trim().toLowerCase());
    const jobDescription = (job.description || '').toLowerCase();
    const candidateBio = (candidate.profile?.bio || '').toLowerCase();
    const resumeText = (candidate.profile?.resumeText || '').toLowerCase();

    // Skill Set Analysis
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    jobRequirements.forEach((req) => {
      const isMatch = candidateSkills.some(
        (sk) => sk === req || sk.includes(req) || req.includes(sk)
      ) || candidateBio.includes(req) || resumeText.includes(req);

      if (isMatch) {
        matchingSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    });

    // Calculate match percentage
    let baseScore = 0;
    if (jobRequirements.length > 0) {
      const matchRatio = matchingSkills.length / jobRequirements.length;
      baseScore = Math.round(matchRatio * 75); // up to 75 points from explicit requirement overlap
    } else {
      baseScore = 60;
    }

    // Additional relevance points (experience, bio keywords, headline)
    let bonus = 0;
    if (candidate.profile?.experience && candidate.profile.experience.length > 0) {
      bonus += 15;
    }
    if (candidateBio.length > 50 || resumeText.length > 50) {
      bonus += 10;
    }

    const matchScore = Math.min(100, Math.max(25, baseScore + bonus));

    // Formulate strengths & recommendations
    const strengths: string[] = [];
    const recommendations: string[] = [];

    if (matchingSkills.length > 0) {
      strengths.push(`Direct alignment on ${matchingSkills.slice(0, 3).join(', ')}.`);
    }
    if (candidate.profile?.experience && candidate.profile.experience.length > 0) {
      strengths.push(`Proven industry work history with ${candidate.profile.experience.length} relevant role(s).`);
    }

    if (missingSkills.length > 0) {
      recommendations.push(`Consider highlighting experience with ${missingSkills.slice(0, 3).join(', ')}.`);
    } else {
      recommendations.push('Candidate meets or exceeds all core required skills.');
    }

    let summaryRating = 'Moderate Match';
    if (matchScore >= 85) summaryRating = 'High Synergy Match';
    else if (matchScore >= 70) summaryRating = 'Strong Potential Match';

    const analysis = `${summaryRating} (${matchScore}%). ${matchingSkills.length} out of ${
      jobRequirements.length || 1
    } key requirements matched directly. Candidate demonstrates strong skill relevance for ${job.title}.`;

    return {
      matchScore,
      analysis,
      matchingSkills,
      missingSkills,
      strengths,
      recommendations,
    };
  }

  /**
   * Generate LinkedIn-style professional headline, bio, and suggested skills.
   */
  public static async generateBio(data: {
    name: string;
    targetRole?: string;
    currentSkills: string[];
    yearsOfExperience?: string;
  }): Promise<BioGenerationResult> {
    const role = data.targetRole || 'Software Professional';
    const skillsList = data.currentSkills.length > 0 ? data.currentSkills.join(', ') : 'software engineering, problem solving, and modern web tech';
    const expText = data.yearsOfExperience ? `with ${data.yearsOfExperience} years of hands-on experience` : 'with a proven track record';

    const headline = `Senior ${role} | ${data.currentSkills.slice(0, 4).join(' • ') || 'Full Stack & Cloud Applications'}`;

    const bio = `Driven and results-oriented ${role} ${expText}. Specialized in ${skillsList}. Passionate about architecting clean, maintainable software architectures and delivering high-impact products. Experienced in agile collaboration, microservices, and modern user-centric interfaces.`;

    const suggestedSkills = Array.from(
      new Set([
        ...data.currentSkills,
        'System Architecture',
        'CI/CD Pipelines',
        'RESTful APIs',
        'Agile Methodology',
        'Code Optimization',
      ])
    ).slice(0, 10);

    return {
      headline,
      bio,
      suggestedSkills,
    };
  }

  /**
   * AI Job Description Enhancer
   */
  public static async enhanceJobDescription(data: {
    title: string;
    rawDescription: string;
    companyName?: string;
  }): Promise<EnhanceJobResult> {
    const company = data.companyName || 'Our Organization';
    const title = data.title || 'Software Specialist';

    const enhancedDescription = `${company} is looking for an exceptional ${title} to join our high-growth technology team.

Key Responsibilities:
• Lead the design, development, and maintenance of scalable enterprise features.
• Collaborate cross-functionally with product managers, UX designers, and system architects.
• Drive code quality through automated testing, peer reviews, and performance benchmarking.
• Innovate and implement modern engineering standards across team workflows.

What We Are Looking For:
• Strong problem-solving mindset with hands-on experience in modern technology stacks.
• Proven capability in building responsive, high-availability, and reliable systems.
• Excellent communication skills and passion for continuous learning.`;

    // Extract key requirements from title and description
    const extractedRequirements: string[] = [];
    const textLower = `${title} ${data.rawDescription}`.toLowerCase();

    const techKeywords = [
      'React',
      'TypeScript',
      'Node.js',
      'Express',
      'MongoDB',
      'Python',
      'Docker',
      'Tailwind CSS',
      'AWS',
      'GraphQL',
      'REST API',
      'System Architecture',
      'Agile',
      'CI/CD',
    ];

    techKeywords.forEach((tech) => {
      if (textLower.includes(tech.toLowerCase()) || title.toLowerCase().includes(tech.toLowerCase())) {
        extractedRequirements.push(tech);
      }
    });

    if (extractedRequirements.length === 0) {
      extractedRequirements.push('React', 'TypeScript', 'Node.js', 'REST API', 'System Architecture');
    }

    const suggestedKeywords = Array.from(
      new Set(
        extractedRequirements
          .map((r) => r.toLowerCase())
          .concat(['remote', 'fullstack', 'software engineering', 'high growth', 'tech'])
      )
    );

    return {
      enhancedDescription,
      extractedRequirements,
      suggestedKeywords,
    };
  }
}
