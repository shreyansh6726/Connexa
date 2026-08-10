import 'job_model.dart';
import 'user_model.dart';

class ApplicationModel {
  final String id;
  final String jobId;
  final String applicantId;
  final String status; // 'SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW', 'HIRED', 'REJECTED'
  final String appliedAt;
  final double? aiMatchScore;
  final String? coverNote;
  final JobModel? job;
  final UserModel? applicant;

  ApplicationModel({
    required this.id,
    required this.jobId,
    required this.applicantId,
    required this.status,
    required this.appliedAt,
    this.aiMatchScore,
    this.coverNote,
    this.job,
    this.applicant,
  });

  factory ApplicationModel.fromJson(Map<String, dynamic> json) {
    return ApplicationModel(
      id: json['id'] ?? json['_id'] ?? '',
      jobId: json['jobId'] ?? '',
      applicantId: json['applicantId'] ?? '',
      status: json['status'] ?? 'SUBMITTED',
      appliedAt: json['appliedAt'] ?? '',
      aiMatchScore: (json['aiMatchScore'] as num?)?.toDouble(),
      coverNote: json['coverNote'],
      job: json['job'] != null ? JobModel.fromJson(json['job']) : null,
      applicant: json['applicant'] != null ? UserModel.fromJson(json['applicant']) : null,
    );
  }
}
