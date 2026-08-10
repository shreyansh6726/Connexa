class UserModel {
  final String id;
  final String email;
  final String name;
  final String role; // 'EMPLOYEE', 'EMPLOYER', 'ADMIN'
  final String? companyName;
  final String? title;
  final List<String> skills;
  final String? bio;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    this.companyName,
    this.title,
    this.skills = const [],
    this.bio,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'];
    final profileMap = profile is Map ? profile : <String, dynamic>{};
    return UserModel(
      id: json['id'] ?? json['_id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      role: json['role'] ?? 'EMPLOYEE',
      companyName: json['companyName'],
      title: json['title'] ?? profileMap['headline'],
      skills: ((json['skills'] ?? profileMap['skills']) as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      bio: json['bio'] ?? profileMap['bio'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role,
      'companyName': companyName,
      'title': title,
      'skills': skills,
      'bio': bio,
    };
  }
}
