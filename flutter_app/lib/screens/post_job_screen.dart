import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/job_provider.dart';
import '../providers/auth_provider.dart';

class PostJobScreen extends StatefulWidget {
  const PostJobScreen({Key? key}) : super(key: key);

  @override
  State<PostJobScreen> createState() => _PostJobScreenState();
}

class _PostJobScreenState extends State<PostJobScreen> {
  final _titleCtrl = TextEditingController();
  final _companyCtrl = TextEditingController();
  final _salaryCtrl = TextEditingController(text: '\$120,000 - \$160,000');
  final _locationCtrl = TextEditingController(text: 'Remote');
  final _descCtrl = TextEditingController();
  final _skillsCtrl = TextEditingController(text: 'React, Flutter, TypeScript, Node.js');
  String _jobType = 'Full-time';
  bool _isGeneratingAI = false;

  void _generateAIDescription() async {
    if (_titleCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a Job Title first')),
      );
      return;
    }
    setState(() => _isGeneratingAI = true);
    await Future.delayed(const Duration(milliseconds: 1000));
    if (!mounted) return;

    final title = _titleCtrl.text.trim();
    setState(() {
      _isGeneratingAI = false;
      _descCtrl.text =
          'We are seeking a high-performing $title to drive innovation across our core platforms. '
          'You will collaborate with cross-functional teams, architect clean resilient systems, and contribute to production services.';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('\u{2728} AI generated a tailored description!'), backgroundColor: Color(0xFF4F46E5)),
    );
  }

  Future<void> _handleSubmit() async {
    if (_titleCtrl.text.isEmpty || _descCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Title and Description are required')),
      );
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final jobProvider = Provider.of<JobProvider>(context, listen: false);

    final success = await jobProvider.createJob(
      title: _titleCtrl.text.trim(),
      company: _companyCtrl.text.trim().isNotEmpty
          ? _companyCtrl.text.trim()
          : (auth.user?.companyName ?? 'Connexa Tech'),
      location: _locationCtrl.text.trim(),
      type: _jobType,
      salary: _salaryCtrl.text.trim(),
      description: _descCtrl.text.trim(),
      requirements: ['3+ years experience', 'Strong system design skills', 'Collaborative mindset'],
      skills: _skillsCtrl.text.split(',').map((s) => s.trim()).toList(),
    );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('\u{1F680} Job opening published!'), backgroundColor: Color(0xFF10B981)),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(title: const Text('Post Job Opening')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Job Title', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _titleCtrl,
                        decoration: const InputDecoration(hintText: 'e.g. Senior Mobile Engineer'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Company Name', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _companyCtrl,
                        decoration: const InputDecoration(hintText: 'Company Name'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Location', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      TextField(
                        controller: _locationCtrl,
                        decoration: const InputDecoration(hintText: 'Remote / San Francisco'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            const Text('Job Type', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _jobType,
              items: ['Full-time', 'Part-time', 'Contract', 'Remote'].map((t) {
                return DropdownMenuItem(value: t, child: Text(t));
              }).toList(),
              onChanged: (val) => setState(() => _jobType = val!),
            ),
            const SizedBox(height: 16),

            const Text('Salary Range', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _salaryCtrl,
              decoration: const InputDecoration(hintText: '\$100,000 - \$140,000'),
            ),
            const SizedBox(height: 16),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Job Description', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                TextButton.icon(
                  onPressed: _isGeneratingAI ? null : _generateAIDescription,
                  icon: const Icon(Icons.auto_awesome, size: 14, color: Color(0xFF4F46E5)),
                  label: _isGeneratingAI
                      ? const SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('AI Enhancer', style: TextStyle(fontSize: 12, color: Color(0xFF4F46E5), fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _descCtrl,
              maxLines: 4,
              decoration: const InputDecoration(hintText: 'Describe responsibilities and requirements...'),
            ),
            const SizedBox(height: 16),

            const Text('Required Skills (comma separated)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            TextField(
              controller: _skillsCtrl,
              decoration: const InputDecoration(hintText: 'Flutter, Dart, Firebase, REST API'),
            ),
            const SizedBox(height: 28),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _handleSubmit,
                child: const Text('Publish Job Listing'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
