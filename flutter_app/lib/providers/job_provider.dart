import 'package:flutter/material.dart';
import '../models/job_model.dart';
import '../models/application_model.dart';
import '../services/api_service.dart';

class JobProvider extends ChangeNotifier {
  List<JobModel> _jobs = [];
  List<ApplicationModel> _myApplications = [];
  bool _isLoading = false;
  String? _error;
  String _searchQuery = '';
  String _selectedType = 'ALL';

  List<JobModel> get jobs => _filteredJobs();
  List<ApplicationModel> get myApplications => _myApplications;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get searchQuery => _searchQuery;
  String get selectedType => _selectedType;

  void setSearchQuery(String q) {
    _searchQuery = q;
    notifyListeners();
  }

  void setFilterType(String type) {
    _selectedType = type;
    notifyListeners();
  }

  List<JobModel> _filteredJobs() {
    return _jobs.where((job) {
      final matchesSearch = job.title.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          job.company.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          job.skills.any((s) => s.toLowerCase().contains(_searchQuery.toLowerCase()));
      
      final matchesType = _selectedType == 'ALL' || job.type.toLowerCase() == _selectedType.toLowerCase();
      
      return matchesSearch && matchesType;
    }).toList();
  }

  Future<void> fetchJobs() async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final res = await ApiService.get('/jobs');
      if (res['jobs'] != null) {
        final List<dynamic> list = res['jobs'];
        _jobs = list.map((item) => JobModel.fromJson(item)).toList();
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchMyApplications() async {
    try {
      final res = await ApiService.get('/applications/employee');
      if (res['applications'] != null) {
        final List<dynamic> list = res['applications'];
        _myApplications = list.map((item) => ApplicationModel.fromJson(item)).toList();
        notifyListeners();
      }
    } catch (e) {
      // debug message
    }
  }

  Future<bool> applyToJob(String jobId, {String? coverNote}) async {
    try {
      await ApiService.post('/applications/apply', {
        'jobId': jobId,
        'coverNote': coverNote ?? '',
      });
      await fetchMyApplications();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  Future<bool> createJob({
    required String title,
    required String company,
    required String location,
    required String type,
    required String salary,
    required String description,
    required List<String> requirements,
    required List<String> skills,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final salaryValues = RegExp(r'[\d,]+')
          .allMatches(salary)
          .map((match) => int.tryParse(match.group(0)!.replaceAll(',', '')))
          .whereType<int>()
          .toList();
      final minSalary = salaryValues.isNotEmpty ? salaryValues.first : 0;
      final maxSalary = salaryValues.length > 1 ? salaryValues[1] : minSalary;
      final apiType = switch (type.toLowerCase()) {
        'full-time' => 'FULL_TIME',
        'part-time' => 'PART_TIME',
        'remote' => 'REMOTE',
        'contract' => 'CONTRACT',
        _ => 'FULL_TIME',
      };

      final res = await ApiService.post('/jobs', {
        'title': title,
        'companyName': company,
        'location': location,
        'jobType': apiType,
        'salaryRange': {'min': minSalary, 'max': maxSalary, 'currency': 'USD'},
        'description': description,
        'requirements': requirements,
        'keywords': skills,
      });

      if (res['job'] != null) {
        await fetchJobs();
        return true;
      }
      return false;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
