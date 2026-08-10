import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _user;
  bool _isLoading = false;
  String? _error;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  String? get error => _error;

  AuthProvider() {
    _checkStoredAuth();
  }

  Future<void> _checkStoredAuth() async {
    final token = await ApiService.getToken();
    if (token != null) {
      try {
        _isLoading = true;
        notifyListeners();
        final res = await ApiService.get('/auth/me');
        if (res['user'] != null) {
          _user = UserModel.fromJson(res['user']);
        }
      } catch (e) {
        await ApiService.clearToken();
        _user = null;
      } finally {
        _isLoading = false;
        notifyListeners();
      }
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final res = await ApiService.post('/auth/login', {
        'email': email,
        'password': password,
      });

      if (res['token'] != null && res['user'] != null) {
        await ApiService.saveToken(res['token']);
        _user = UserModel.fromJson(res['user']);
        _isLoading = false;
        notifyListeners();
        return true;
      }
      throw Exception('Invalid response format');
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String role,
    String? companyName,
    List<String>? skills,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final res = await ApiService.post('/auth/register', {
        'name': name,
        'email': email,
        'password': password,
        'role': role,
        'companyName': companyName,
        'skills': skills ?? [],
      });

      if (res['token'] != null && res['user'] != null) {
        await ApiService.saveToken(res['token']);
        _user = UserModel.fromJson(res['user']);
        _isLoading = false;
        notifyListeners();
        return true;
      }
      throw Exception('Registration failed');
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await ApiService.clearToken();
    _user = null;
    notifyListeners();
  }
}
