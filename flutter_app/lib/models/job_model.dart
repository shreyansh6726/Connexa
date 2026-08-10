class JobModel {
  final String id;
  final String title;
  final String company;
  final String location;
  final String type; // 'Full-time', 'Part-time', 'Contract', 'Remote'
  final String salary;
  final String description;
  final List<String> requirements;
  final List<String> skills;
  final String employerId;
  final String createdAt;
  final String status; // 'OPEN', 'CLOSED'
  final double? aiMatchScore; // Computed match % for candidates

  JobModel({
    required this.id,
    required this.title,
    required this.company,
    required this.location,
    required this.type,
    required this.salary,
    required this.description,
    required this.requirements,
    required this.skills,
    required this.employerId,
    required this.createdAt,
    this.status = 'OPEN',
    this.aiMatchScore,
  });

  factory JobModel.fromJson(Map<String, dynamic> json) {
    final salaryRange = json['salaryRange'];
    final postedBy = json['postedBy'];
    final salary = json['salary'] ??
        (salaryRange is Map
            ? '\$${salaryRange['min'] ?? 0} - \$${salaryRange['max'] ?? 0}'
            : salaryRange ?? '');

    return JobModel(
      id: json['id'] ?? json['_id'] ?? '',
      title: json['title'] ?? '',
      company: json['company'] ?? json['companyName'] ?? '',
      location: json['location'] ?? '',
      type: _displayType(json['type'] ?? json['jobType']),
      salary: salary.toString(),
      description: json['description'] ?? '',
      requirements: (json['requirements'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      skills: ((json['skills'] ?? json['keywords']) as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      employerId: json['employerId'] ?? (postedBy is Map ? (postedBy['id'] ?? postedBy['_id']) : '') ?? '',
      createdAt: json['createdAt'] ?? '',
      status: json['status'] ?? 'OPEN',
      aiMatchScore: (json['aiMatchScore'] as num?)?.toDouble(),
    );
  }

  static String _displayType(dynamic value) {
    switch (value?.toString().toUpperCase()) {
      case 'FULL_TIME':
        return 'Full-time';
      case 'PART_TIME':
        return 'Part-time';
      case 'REMOTE':
        return 'Remote';
      case 'CONTRACT':
        return 'Contract';
      case 'INTERNSHIP':
        return 'Internship';
      default:
        return value?.toString() ?? 'Full-time';
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'company': company,
      'location': location,
      'type': type,
      'salary': salary,
      'description': description,
      'requirements': requirements,
      'skills': skills,
      'employerId': employerId,
      'createdAt': createdAt,
      'status': status,
    };
  }

  JobModel copyWithMatch(double score) {
    return JobModel(
      id: id,
      title: title,
      company: company,
      location: location,
      type: type,
      salary: salary,
      description: description,
      requirements: requirements,
      skills: skills,
      employerId: employerId,
      createdAt: createdAt,
      status: status,
      aiMatchScore: score,
    );
  }
}
