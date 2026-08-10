import 'package:flutter/material.dart';

class AiMatchBadge extends StatelessWidget {
  final double score; // 0 to 100
  final bool isCompact;

  const AiMatchBadge({
    Key? key,
    required this.score,
    this.isCompact = false,
  }) : super(key: key);

  Color _getBadgeColor(double val) {
    if (val >= 85) return const Color(0xFF10B981); // Emerald
    if (val >= 70) return const Color(0xFF4F46E5); // Indigo
    if (val >= 50) return const Color(0xFFF59E0B); // Amber
    return const Color(0xFF64748B); // Slate
  }

  @override
  Widget build(BuildContext context) {
    final color = _getBadgeColor(score);
    final roundedScore = score.round();

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 8 : 12,
        vertical: isCompact ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.auto_awesome,
            size: isCompact ? 12 : 14,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            '$roundedScore% Match',
            style: TextStyle(
              fontSize: isCompact ? 11 : 12,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
