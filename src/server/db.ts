import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Collection, Db, MongoClient } from 'mongodb';
import { Application, Job, Notification, User } from '../types';

// Default Seed Data Generator
function getSeedPasswordHash() {
  // Sync hash for seed data initialization
  return bcrypt.hashSync('password123', 10);
}

function getSeedUsers(): User[] {
  const passwordHash = getSeedPasswordHash();
  return [
    {
      _id: 'user-admin-1',
      name: 'Alex Rivera',
      email: 'admin@connexa.com',
      role: 'ADMIN',
      companyName: 'Connexa Platform',
      contactDetails: {
        location: 'San Francisco, CA',
        phone: '+1 (555) 019-2831',
        linkedinUrl: 'https://linkedin.com/in/alex-rivera-admin',
        githubUrl: 'https://github.com/admin-connexa',
        website: 'https://connexa.com',
      },
      profile: {
        headline: 'Connexa Lead Administrator & Platform Ops',
        bio: 'Overseeing global platform integrity, job quality verification, and enterprise user onboarding on Connexa.',
        skills: ['Platform Operations', 'Security & Compliance', 'Data Analytics', 'Community Management'],
        experience: [
          {
            id: 'exp-admin-1',
            company: 'Connexa Systems',
            title: 'Lead Platform Administrator',
            startDate: '2023-01-01',
            current: true,
            description: 'Managing system moderation, verified employer credentials, and network metrics.',
          },
        ],
      },
      createdAt: new Date('2025-01-01').toISOString(),
    },
    {
      _id: 'user-emp-1',
      name: 'Sarah Jenkins',
      email: 'employer1@techcorp.com',
      role: 'EMPLOYER',
      companyName: 'TechCorp Innovations',
      contactDetails: {
        location: 'San Francisco, CA',
        phone: '+1 (555) 392-1049',
        linkedinUrl: 'https://linkedin.com/in/sarah-jenkins-techcorp',
        website: 'https://techcorpinnovations.com',
      },
      profile: {
        headline: 'Head of Global Talent Acquisition at TechCorp',
        bio: 'Building elite engineering, AI, and design teams at TechCorp. Always searching for forward-thinking builders.',
        skills: ['Technical Recruiting', 'Talent Strategy', 'Engineering Leadership', 'Employer Branding'],
        experience: [
          {
            id: 'exp-emp-1',
            company: 'TechCorp Innovations',
            title: 'Head of Talent Acquisition',
            startDate: '2021-04-01',
            current: true,
            description: 'Scaled engineering headcount from 40 to 250+ across US and EMEA regions.',
          },
        ],
      },
      createdAt: new Date('2025-01-10').toISOString(),
    },
    {
      _id: 'user-emp-2',
      name: 'Marcus Vance',
      email: 'employer2@innovate.io',
      role: 'EMPLOYER',
      companyName: 'Innovate AI Labs',
      contactDetails: {
        location: 'New York, NY',
        phone: '+1 (555) 881-2094',
        linkedinUrl: 'https://linkedin.com/in/marcus-vance-ai',
        website: 'https://innovateailabs.com',
      },
      profile: {
        headline: 'Engineering Director & Hiring Lead at Innovate AI',
        bio: 'Leading generative AI research and enterprise LLM production deployments. Hiring top tier ML & backend engineers.',
        skills: ['AI Strategy', 'System Architecture', 'Machine Learning Leadership', 'Technical Hiring'],
        experience: [
          {
            id: 'exp-emp-2',
            company: 'Innovate AI Labs',
            title: 'Director of Engineering',
            startDate: '2022-08-15',
            current: true,
            description: 'Overseeing core AI infrastructure and LLM application development.',
          },
        ],
      },
      createdAt: new Date('2025-01-12').toISOString(),
    },
    {
      _id: 'user-dev-1',
      name: 'David Chen',
      email: 'john.doe@email.com',
      role: 'EMPLOYEE',
      contactDetails: {
        location: 'San Francisco, CA',
        phone: '+1 (555) 402-9182',
        linkedinUrl: 'https://linkedin.com/in/davidchen-dev',
        githubUrl: 'https://github.com/davidchen-fullstack',
        website: 'https://davidchen.dev',
      },
      profile: {
        headline: 'Senior Full Stack Engineer | React, Node.js, TypeScript, Cloud Architecture',
        bio: 'Passionate Full Stack Engineer with 6+ years building high-performance web platforms, real-time APIs, and microservices.',
        skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Docker', 'REST API', 'GraphQL'],
        resumeText: 'David Chen - Senior Full Stack Engineer. Expert in React 18, Node.js, TypeScript, Express, MongoDB, and Tailwind CSS. Built cloud dashboard serving 50k DAU.',
        experience: [
          {
            id: 'exp-dev-1',
            company: 'CloudSphere Systems',
            title: 'Senior Frontend Engineer',
            startDate: '2022-01-10',
            current: true,
            description: 'Architected modular React design systems and improved core web vitals by 45%.',
          },
          {
            id: 'exp-dev-2',
            company: 'Nexus Software Solutions',
            title: 'Full Stack Developer',
            startDate: '2019-06-01',
            endDate: '2021-12-31',
            current: false,
            description: 'Developed Node.js microservices and RESTful endpoints for enterprise clients.',
          },
        ],
      },
      createdAt: new Date('2025-01-15').toISOString(),
    },
    {
      _id: 'user-dev-2',
      name: 'Elena Rostova',
      email: 'jane.smith@email.com',
      role: 'EMPLOYEE',
      contactDetails: {
        location: 'Seattle, WA',
        phone: '+1 (555) 712-4091',
        linkedinUrl: 'https://linkedin.com/in/elena-rostova-ai',
        githubUrl: 'https://github.com/elena-rostova',
      },
      profile: {
        headline: 'AI / Machine Learning Engineer & Python Developer',
        bio: 'Specializing in Large Language Models (LLMs), natural language processing, vector databases, and scalable inference APIs.',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'OpenAI API', 'FastAPI', 'Docker', 'Machine Learning', 'Data Pipelines'],
        resumeText: 'Elena Rostova - Machine Learning Engineer specializing in LLM fine-tuning, Python, FastAPI, PyTorch, vector retrieval (RAG), and model optimization.',
        experience: [
          {
            id: 'exp-dev-3',
            company: 'DeepMind Labs Partner',
            title: 'AI Research Engineer',
            startDate: '2023-03-01',
            current: true,
            description: 'Trained custom LLMs for specialized domain tasks and optimized token throughput.',
          },
        ],
      },
      createdAt: new Date('2025-01-18').toISOString(),
    },
    {
      _id: 'user-dev-3',
      name: 'Alex Devlin',
      email: 'alex.dev@email.com',
      role: 'EMPLOYEE',
      contactDetails: {
        location: 'Austin, TX',
        phone: '+1 (555) 203-8819',
        linkedinUrl: 'https://linkedin.com/in/alexdevlin-design',
        website: 'https://alexdevlin.design',
      },
      profile: {
        headline: 'Product Designer & Frontend UI/UX Developer',
        bio: 'Creating human-centric digital interfaces and scalable frontend UI code. Skilled in Figma, Tailwind CSS, and accessible React components.',
        skills: ['React', 'Figma', 'UI/UX Design', 'Tailwind CSS', 'TypeScript', 'Design Systems', 'Accessibility'],
        resumeText: 'Alex Devlin - Product Designer & Frontend UI Developer with expertise in Figma design systems, Tailwind CSS, React, and UX research.',
        experience: [
          {
            id: 'exp-dev-4',
            company: 'PixelCraft Design',
            title: 'Lead UI/UX Designer',
            startDate: '2021-08-01',
            endDate: '2025-01-01',
            current: false,
            description: 'Designed unified design system used by 15 internal product teams.',
          },
        ],
      },
      createdAt: new Date('2025-01-20').toISOString(),
    },
  ];
}

function getSeedJobs(): Job[] {
  return [
    {
      _id: 'job-1',
      postedBy: {
        _id: 'user-emp-1',
        name: 'Sarah Jenkins',
        companyName: 'TechCorp Innovations',
        email: 'employer1@techcorp.com',
      },
      title: 'Senior Full Stack TypeScript Engineer',
      companyName: 'TechCorp Innovations',
      location: 'Remote (US / Canada)',
      jobType: 'REMOTE',
      salaryRange: { min: 140000, max: 180000, currency: 'USD' },
      description:
        'TechCorp Innovations is seeking a Senior Full Stack TypeScript Engineer to architect high-impact SaaS products. You will work across React 18, Node.js microservices, Express, and modern data layers to build responsive user experiences and robust APIs.',
      requirements: [
        'React',
        'TypeScript',
        'Node.js',
        'Express',
        'REST API',
        'MongoDB',
        'Tailwind CSS',
        'System Architecture',
      ],
      keywords: ['fullstack', 'react', 'typescript', 'nodejs', 'express', 'remote', 'saas'],
      status: 'OPEN',
      applicantCount: 2,
      createdAt: new Date('2025-02-01').toISOString(),
    },
    {
      _id: 'job-2',
      postedBy: {
        _id: 'user-emp-2',
        name: 'Marcus Vance',
        companyName: 'Innovate AI Labs',
        email: 'employer2@innovate.io',
      },
      title: 'AI / LLM Solutions Engineer',
      companyName: 'Innovate AI Labs',
      location: 'New York, NY (Hybrid)',
      jobType: 'FULL_TIME',
      salaryRange: { min: 160000, max: 210000, currency: 'USD' },
      description:
        'Innovate AI Labs is hiring an AI / LLM Solutions Engineer to develop state-of-the-art generative AI agents, vector indexing pipelines, and real-time intelligent chat APIs for enterprise clients.',
      requirements: [
        'Python',
        'PyTorch',
        'LLMs',
        'OpenAI API',
        'FastAPI',
        'Docker',
        'Vector Search',
        'Prompt Engineering',
      ],
      keywords: ['ai', 'llm', 'python', 'pytorch', 'fastapi', 'vector', 'machine learning'],
      status: 'OPEN',
      applicantCount: 1,
      createdAt: new Date('2025-02-02').toISOString(),
    },
    {
      _id: 'job-3',
      postedBy: {
        _id: 'user-emp-1',
        name: 'Sarah Jenkins',
        companyName: 'TechCorp Innovations',
        email: 'employer1@techcorp.com',
      },
      title: 'Lead Frontend UI/UX Developer',
      companyName: 'TechCorp Innovations',
      location: 'San Francisco, CA',
      jobType: 'FULL_TIME',
      salaryRange: { min: 130000, max: 165000, currency: 'USD' },
      description:
        'Join TechCorp as Lead Frontend Engineer to shape our next-generation web platforms. You will collaborate closely with product design to build intuitive, WCAG-compliant UI component libraries in React and Tailwind CSS.',
      requirements: [
        'React',
        'Tailwind CSS',
        'TypeScript',
        'UI/UX Design',
        'Figma',
        'Design Systems',
        'Performance Optimization',
      ],
      keywords: ['frontend', 'react', 'tailwind', 'ui/ux', 'design systems', 'figma'],
      status: 'OPEN',
      applicantCount: 1,
      createdAt: new Date('2025-02-03').toISOString(),
    },
    {
      _id: 'job-4',
      postedBy: {
        _id: 'user-emp-2',
        name: 'Marcus Vance',
        companyName: 'Innovate AI Labs',
        email: 'employer2@innovate.io',
      },
      title: 'Backend Distributed Systems Engineer',
      companyName: 'Innovate AI Labs',
      location: 'Remote',
      jobType: 'REMOTE',
      salaryRange: { min: 135000, max: 175000, currency: 'USD' },
      description:
        'Looking for a Senior Backend Systems Engineer to build resilient distributed services, message streaming, and highly available databases supporting millions of daily AI queries.',
      requirements: [
        'Node.js',
        'Express',
        'MongoDB',
        'Docker',
        'REST API',
        'TypeScript',
        'Microservices',
      ],
      keywords: ['backend', 'nodejs', 'express', 'mongodb', 'docker', 'microservices'],
      status: 'OPEN',
      applicantCount: 0,
      createdAt: new Date('2025-02-04').toISOString(),
    },
    {
      _id: 'job-5',
      postedBy: {
        _id: 'user-emp-1',
        name: 'Sarah Jenkins',
        companyName: 'TechCorp Innovations',
        email: 'employer1@techcorp.com',
      },
      title: 'Product Manager - Enterprise Cloud Platform',
      companyName: 'TechCorp Innovations',
      location: 'San Francisco, CA',
      jobType: 'FULL_TIME',
      salaryRange: { min: 150000, max: 195000, currency: 'USD' },
      description:
        'Own the product roadmap for TechCorp cloud infrastructure tools. Define product specs, conduct customer interviews, and partner with engineering to deliver enterprise-ready features.',
      requirements: [
        'Product Strategy',
        'Roadmapping',
        'Agile Leadership',
        'SaaS Product',
        'User Analytics',
      ],
      keywords: ['product manager', 'saas', 'agile', 'cloud', 'strategy'],
      status: 'OPEN',
      applicantCount: 0,
      createdAt: new Date('2025-02-05').toISOString(),
    },
  ];
}

function getSeedApplications(): Application[] {
  return [
    {
      _id: 'app-1',
      job: 'job-1',
      jobId: 'job-1',
      jobTitle: 'Senior Full Stack TypeScript Engineer',
      companyName: 'TechCorp Innovations',
      applicant: 'user-dev-1',
      applicantId: 'user-dev-1',
      applicantName: 'David Chen',
      applicantEmail: 'john.doe@email.com',
      applicantSkills: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
      employer: 'user-emp-1',
      employerId: 'user-emp-1',
      status: 'SHORTLISTED',
      aiMatchScore: 92,
      aiMatchAnalysis:
        'Outstanding fit! Candidate has direct skill overlap in React, TypeScript, Node.js, Express, MongoDB, and Tailwind CSS with 6+ years of full-stack engineering experience.',
      appliedAt: new Date('2025-02-02T10:30:00Z').toISOString(),
    },
    {
      _id: 'app-2',
      job: 'job-2',
      jobId: 'job-2',
      jobTitle: 'AI / LLM Solutions Engineer',
      companyName: 'Innovate AI Labs',
      applicant: 'user-dev-2',
      applicantId: 'user-dev-2',
      applicantName: 'Elena Rostova',
      applicantEmail: 'jane.smith@email.com',
      applicantSkills: ['Python', 'PyTorch', 'LLMs', 'OpenAI API', 'FastAPI', 'Docker'],
      employer: 'user-emp-2',
      employerId: 'user-emp-2',
      status: 'PENDING',
      aiMatchScore: 96,
      aiMatchAnalysis:
        'Exceptional alignment! Candidate possesses exact matching skills in Python, PyTorch, LLM fine-tuning, OpenAI API, and FastAPI.',
      appliedAt: new Date('2025-02-03T14:15:00Z').toISOString(),
    },
    {
      _id: 'app-3',
      job: 'job-3',
      jobId: 'job-3',
      jobTitle: 'Lead Frontend UI/UX Developer',
      companyName: 'TechCorp Innovations',
      applicant: 'user-dev-3',
      applicantId: 'user-dev-3',
      applicantName: 'Alex Devlin',
      applicantEmail: 'alex.dev@email.com',
      applicantSkills: ['React', 'Figma', 'UI/UX Design', 'Tailwind CSS', 'TypeScript'],
      employer: 'user-emp-1',
      employerId: 'user-emp-1',
      status: 'REVIEWED',
      aiMatchScore: 89,
      aiMatchAnalysis:
        'Strong match! High synergy in React, Tailwind CSS, Figma, and design system building.',
      appliedAt: new Date('2025-02-04T09:00:00Z').toISOString(),
    },
  ];
}

function getSeedNotifications(): Notification[] {
  return [
    {
      _id: 'notif-1',
      recipient: 'ADMIN_ALL',
      sender: {
        _id: 'user-emp-1',
        name: 'Sarah Jenkins (TechCorp Innovations)',
      },
      type: 'NEW_JOB_POSTED',
      title: 'New Job Listing Posted',
      message: 'TechCorp Innovations posted a new opening: Senior Full Stack TypeScript Engineer.',
      link: '/admin',
      isRead: false,
      createdAt: new Date('2025-02-01T08:00:00Z').toISOString(),
    },
    {
      _id: 'notif-2',
      recipient: 'ADMIN_ALL',
      sender: {
        _id: 'user-emp-2',
        name: 'Marcus Vance (Innovate AI Labs)',
      },
      type: 'NEW_JOB_POSTED',
      title: 'New Job Listing Posted',
      message: 'Innovate AI Labs posted a new position: AI / LLM Solutions Engineer.',
      link: '/admin',
      isRead: false,
      createdAt: new Date('2025-02-02T09:15:00Z').toISOString(),
    },
    {
      _id: 'notif-3',
      recipient: 'user-emp-1',
      sender: {
        _id: 'user-dev-1',
        name: 'David Chen',
      },
      type: 'NEW_APPLICATION',
      title: 'New Applicant Received',
      message: 'David Chen submitted an application for Senior Full Stack TypeScript Engineer (AI Match: 92%).',
      link: '/employer/applicants',
      isRead: false,
      createdAt: new Date('2025-02-02T10:30:00Z').toISOString(),
    },
    {
      _id: 'notif-4',
      recipient: 'ADMIN_ALL',
      sender: {
        _id: 'user-dev-2',
        name: 'Elena Rostova',
      },
      type: 'NEW_APPLICATION',
      title: 'Candidate Applied',
      message: 'Elena Rostova applied for AI / LLM Solutions Engineer at Innovate AI Labs.',
      link: '/admin',
      isRead: false,
      createdAt: new Date('2025-02-03T14:15:00Z').toISOString(),
    },
  ];
}

class DatabaseStore {
  private client: MongoClient;
  private db?: Db;
  private ready: Promise<void>;
  private users?: Collection<User>;
  private passwords?: Collection<{ _id: string; hash: string }>;
  private jobs?: Collection<Job>;
  private applications?: Collection<Application>;
  private notifications?: Collection<Notification>;

  constructor() {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri === 'paste-your-mongodb-connection-string-here') {
      throw new Error('MONGODB_URI is required. Add your MongoDB connection string to .env.');
    }
    this.client = new MongoClient(uri);
    this.ready = this.connect();
  }

  private async connect() {
    await this.client.connect();
    this.db = this.client.db(process.env.MONGODB_DB_NAME || 'connexa');
    this.users = this.db.collection<User>('users');
    this.passwords = this.db.collection<{ _id: string; hash: string }>('passwords');
    this.jobs = this.db.collection<Job>('jobs');
    this.applications = this.db.collection<Application>('applications');
    this.notifications = this.db.collection<Notification>('notifications');
    await this.seedIfEnabled();
    console.log(`Connected to MongoDB database "${this.db.databaseName}".`);
  }

  private async seedIfEnabled() {
    if (process.env.MONGODB_SEED !== 'true') return;
    const [users, jobs, applications, notifications] = await Promise.all([
      this.users!.countDocuments(), this.jobs!.countDocuments(), this.applications!.countDocuments(), this.notifications!.countDocuments(),
    ]);
    const hash = getSeedPasswordHash();
    if (!users) {
      const seed = getSeedUsers();
      await this.users!.insertMany(seed);
      await this.passwords!.insertMany(seed.map((u) => ({ _id: u.email.toLowerCase(), hash })));
    }
    if (!jobs) await this.jobs!.insertMany(getSeedJobs());
    if (!applications) await this.applications!.insertMany(getSeedApplications());
    if (!notifications) await this.notifications!.insertMany(getSeedNotifications());
  }

  private async readyCollections() {
    await this.ready;
    return { users: this.users!, passwords: this.passwords!, jobs: this.jobs!, applications: this.applications!, notifications: this.notifications! };
  }

  public async initialize() {
    await this.ready;
  }

  // --- USERS ---
  public async findUserById(id: string): Promise<User | undefined> {
    const { users } = await this.readyCollections();
    return (await users.findOne({ _id: id })) || undefined;
  }

  public async findUserByEmail(email: string): Promise<User | undefined> {
    const { users } = await this.readyCollections();
    return (await users.findOne({ email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' } })) || undefined;
  }

  public async createUser(userData: Partial<User>, passwordHash: string): Promise<User> {
    const newUser: User = {
      _id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: userData.name || 'User',
      email: userData.email!,
      role: userData.role || 'EMPLOYEE',
      companyName: userData.companyName,
      contactDetails: userData.contactDetails || {},
      profile: userData.profile || {
        headline: '',
        bio: '',
        skills: [],
        experience: [],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { users, passwords } = await this.readyCollections();
    await users.insertOne(newUser);
    await passwords.updateOne(
      { _id: newUser.email.toLowerCase() },
      { $set: { hash: passwordHash }, $setOnInsert: { _id: newUser.email.toLowerCase() } },
      { upsert: true }
    );
    return newUser;
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const { users } = await this.readyCollections();
    const existing = await this.findUserById(id);
    if (!existing) return undefined;
    const updated: User = {
      ...existing,
      ...updates,
      contactDetails: {
        ...existing.contactDetails,
        ...updates.contactDetails,
      },
      profile: {
        ...existing.profile,
        ...updates.profile,
        skills: updates.profile?.skills || existing.profile?.skills || [],
        experience: updates.profile?.experience || existing.profile?.experience || [],
      },
      updatedAt: new Date().toISOString(),
    };

    await users.replaceOne({ _id: id }, updated);
    return updated;
  }

  public async verifyPassword(email: string, plainText: string): Promise<boolean> {
    const { passwords } = await this.readyCollections();
    const record = await passwords.findOne({ _id: email.toLowerCase() });
    return !!record && bcrypt.compareSync(plainText, record.hash);
  }

  public async getAllEmployees(keyword?: string, skillFilter?: string): Promise<User[]> {
    const { users } = await this.readyCollections();
    return (await users.find({ role: 'EMPLOYEE' }).toArray()).filter((u) => {
      if (u.role !== 'EMPLOYEE') return false;

      let matchesKeyword = true;
      let matchesSkill = true;

      if (keyword) {
        const k = keyword.toLowerCase();
        const text = `${u.name} ${u.profile?.headline || ''} ${u.profile?.bio || ''} ${u.contactDetails?.location || ''}`.toLowerCase();
        matchesKeyword = text.includes(k);
      }

      if (skillFilter) {
        const s = skillFilter.toLowerCase();
        matchesSkill = (u.profile?.skills || []).some((sk) => sk.toLowerCase().includes(s));
      }

      return matchesKeyword && matchesSkill;
    });
  }

  public async getAllUsers(): Promise<User[]> {
    const { users } = await this.readyCollections();
    return users.find().toArray();
  }

  // --- JOBS ---
  public async getJobs(filters?: {
    keyword?: string;
    location?: string;
    jobType?: string;
    postedBy?: string;
    status?: string;
  }): Promise<Job[]> {
    const { jobs } = await this.readyCollections();
    let result = await jobs.find().toArray();

    if (filters?.postedBy) {
      result = result.filter((j) => j.postedBy._id === filters.postedBy);
    }

    if (filters?.status) {
      result = result.filter((j) => j.status === filters.status);
    }

    if (filters?.jobType && filters.jobType !== 'ALL') {
      result = result.filter((j) => j.jobType === filters.jobType);
    }

    if (filters?.location) {
      const loc = filters.location.toLowerCase();
      result = result.filter((j) => j.location.toLowerCase().includes(loc));
    }

    if (filters?.keyword) {
      const kw = filters.keyword.toLowerCase();
      result = result.filter((j) => {
        const fullText = `${j.title} ${j.companyName} ${j.description} ${(j.requirements || []).join(' ')} ${(j.keywords || []).join(' ')}`.toLowerCase();
        return fullText.includes(kw);
      });
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getJobById(id: string): Promise<Job | undefined> {
    const { jobs } = await this.readyCollections();
    return (await jobs.findOne({ _id: id })) || undefined;
  }

  public async createJob(jobData: Partial<Job>, employer: User): Promise<Job> {
    const newJob: Job = {
      _id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      postedBy: {
        _id: employer._id,
        name: employer.name,
        companyName: employer.companyName || employer.name,
        email: employer.email,
      },
      title: jobData.title || 'Untitled Position',
      companyName: employer.companyName || jobData.companyName || 'Company',
      location: jobData.location || 'Remote',
      jobType: jobData.jobType || 'FULL_TIME',
      salaryRange: jobData.salaryRange || { min: 80000, max: 120000, currency: 'USD' },
      description: jobData.description || '',
      requirements: jobData.requirements || [],
      keywords: jobData.keywords || [],
      status: jobData.status || 'OPEN',
      applicantCount: 0,
      createdAt: new Date().toISOString(),
    };

    const { jobs } = await this.readyCollections();
    await jobs.insertOne(newJob);
    return newJob;
  }

  public async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const existing = await this.getJobById(id);
    if (!existing) return undefined;
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const { jobs } = await this.readyCollections();
    await jobs.replaceOne({ _id: id }, updated);
    return updated;
  }

  public async incrementApplicantCount(jobId: string) {
    const { jobs } = await this.readyCollections();
    await jobs.updateOne({ _id: jobId }, { $inc: { applicantCount: 1 } });
  }

  // --- APPLICATIONS ---
  public async createApplication(appData: Partial<Application>): Promise<Application> {
    const newApp: Application = {
      _id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      job: appData.job || appData.jobId!,
      jobId: appData.jobId,
      jobTitle: appData.jobTitle,
      companyName: appData.companyName,
      applicant: appData.applicant || appData.applicantId!,
      applicantId: appData.applicantId,
      applicantName: appData.applicantName,
      applicantEmail: appData.applicantEmail,
      applicantSkills: appData.applicantSkills || [],
      employer: appData.employer || appData.employerId!,
      employerId: appData.employerId,
      status: appData.status || 'PENDING',
      aiMatchScore: appData.aiMatchScore || 75,
      aiMatchAnalysis: appData.aiMatchAnalysis || 'Application submitted with candidate profile skills match.',
      appliedAt: new Date().toISOString(),
    };

    const { applications } = await this.readyCollections();
    await applications.insertOne(newApp);
    await this.incrementApplicantCount(newApp.jobId!);
    return newApp;
  }

  public async getApplicationsForEmployer(employerId: string, jobId?: string): Promise<Application[]> {
    const { applications } = await this.readyCollections();
    return (await applications.find().toArray()).filter((a) => {
      const matchEmployer = a.employerId === employerId || (typeof a.employer === 'object' && (a.employer as User)._id === employerId);
      if (!matchEmployer) return false;
      if (jobId) return a.jobId === jobId;
      return true;
    });
  }

  public async getApplicationsForApplicant(applicantId: string): Promise<Application[]> {
    const { applications } = await this.readyCollections();
    return applications.find({ $or: [{ applicantId }, { applicant: applicantId }] }).toArray();
  }

  public async getApplicationById(id: string): Promise<Application | undefined> {
    const { applications } = await this.readyCollections();
    return (await applications.findOne({ _id: id })) || undefined;
  }

  public async updateApplicationStatus(id: string, status: Application['status']): Promise<Application | undefined> {
    const app = await this.getApplicationById(id);
    if (!app) return undefined;
    app.status = status;
    const { applications } = await this.readyCollections();
    await applications.replaceOne({ _id: id }, app);
    return app;
  }

  public async getAllApplications(): Promise<Application[]> {
    const { applications } = await this.readyCollections();
    return applications.find().toArray();
  }

  // --- NOTIFICATIONS ---
  public async createNotification(notif: Partial<Notification>): Promise<Notification> {
    const newNotif: Notification = {
      _id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      recipient: notif.recipient || 'ADMIN_ALL',
      sender: notif.sender,
      type: notif.type || 'NEW_JOB_POSTED',
      title: notif.title || 'System Notification',
      message: notif.message || '',
      link: notif.link || '',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const { notifications } = await this.readyCollections();
    await notifications.insertOne(newNotif);
    return newNotif;
  }

  public async getNotificationsForUser(userId: string, role: string): Promise<Notification[]> {
    const { notifications } = await this.readyCollections();
    return notifications.find({ $or: [{ recipient: userId }, ...(role === 'ADMIN' ? [{ recipient: 'ADMIN_ALL' }] : [])] }).sort({ createdAt: -1 }).toArray();
  }

  public async markNotificationRead(id: string, userId: string): Promise<boolean> {
    const { notifications } = await this.readyCollections();
    const result = await notifications.updateOne({ _id: id, $or: [{ recipient: userId }, { recipient: 'ADMIN_ALL' }] }, { $set: { isRead: true } });
    return result.matchedCount > 0;
  }

  public async markAllReadForUser(userId: string, role: string) {
    const { notifications } = await this.readyCollections();
    await notifications.updateMany({ $or: [{ recipient: userId }, ...(role === 'ADMIN' ? [{ recipient: 'ADMIN_ALL' }] : [])] }, { $set: { isRead: true } });
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const db = new DatabaseStore();
