import 'package:flutter/material.dart';

/// Single translation of `client/src/index.css` custom properties into Dart.
///
/// Every widget reads these tokens through [BasisTokens.of]. Never write a
/// raw hex, radius, duration, or font size in a widget file — the only
/// exceptions are Google Maps polyline/marker styling, which takes literal
/// `#318549` and `#6e6e6e`.
@immutable
class BasisTokens extends ThemeExtension<BasisTokens> {
  const BasisTokens({
    required this.paper,
    required this.ink,
    required this.surface,
    required this.surfaceHover,
    required this.surfaceSunken,
    required this.line,
    required this.lineStrong,
    required this.muted,
    required this.disabledFg,
    required this.accentInk,
    required this.accentStrong,
    required this.accentSurface,
    required this.accentLine,
    required this.danger,
    required this.dangerSurface,
    required this.dangerLine,
    required this.warning,
    required this.warningSurface,
    required this.warningLine,
    required this.info,
    required this.infoSurface,
    required this.infoLine,
    required this.onConsequence,
    required this.chart1,
    required this.chart2,
    required this.chart3,
    required this.chart4,
    required this.chart5,
    this.radiusControl = 8,
    this.radiusCard = 12,
    this.radiusPill = 999,
    this.controlSm = 36,
    this.controlMd = 40,
    this.controlLg = 44,
    this.animationMs = 200,
  });

  final Color paper;
  final Color ink;
  final Color surface;
  final Color surfaceHover;
  final Color surfaceSunken;
  final Color line;
  final Color lineStrong;
  final Color muted;
  final Color disabledFg;
  final Color accentInk;
  final Color accentStrong;
  final Color accentSurface;
  final Color accentLine;
  final Color danger;
  final Color dangerSurface;
  final Color dangerLine;
  final Color warning;
  final Color warningSurface;
  final Color warningLine;
  final Color info;
  final Color infoSurface;
  final Color infoLine;
  final Color onConsequence;
  final Color chart1;
  final Color chart2;
  final Color chart3;
  final Color chart4;
  final Color chart5;
  final double radiusControl;
  final double radiusCard;
  final double radiusPill;
  final double controlSm;
  final double controlMd;
  final double controlLg;
  final int animationMs;

  static const BasisTokens light = BasisTokens(
    paper: Color(0xFFFFFFFF),
    ink: Color(0xFF000000),
    surface: Color(0xFFF3F3F3),
    surfaceHover: Color(0xFFE2E2E2),
    surfaceSunken: Color(0xFFFAFAFA),
    line: Color(0xFFE2E2E2),
    lineStrong: Color(0xFFAFAFAF),
    muted: Color(0xFF6E6E6E),
    disabledFg: Color(0xFFAFAFAF),
    accentInk: Color(0xFF318549),
    accentStrong: Color(0xFF26663A),
    accentSurface: Color(0xFFEEF6F1),
    accentLine: Color(0xFFA9D0B7),
    danger: Color(0xFFB91C1C),
    dangerSurface: Color(0xFFFEF2F2),
    dangerLine: Color(0xFFFECACA),
    warning: Color(0xFFB45309),
    warningSurface: Color(0xFFFFFBEB),
    warningLine: Color(0xFFFDE68A),
    info: Color(0xFF1D4ED8),
    infoSurface: Color(0xFFEFF6FF),
    infoLine: Color(0xFFBFDBFE),
    onConsequence: Color(0xFFFFFFFF),
    chart1: Color(0xFF318549),
    chart2: Color(0xFF1D4ED8),
    chart3: Color(0xFFB45309),
    chart4: Color(0xFF6D28D9),
    chart5: Color(0xFFB91C1C),
  );

  static const BasisTokens dark = BasisTokens(
    paper: Color(0xFF000000),
    ink: Color(0xFFFFFFFF),
    surface: Color(0xFF141414),
    surfaceHover: Color(0xFF232323),
    surfaceSunken: Color(0xFF0A0A0A),
    line: Color(0xFF2E2E2E),
    lineStrong: Color(0xFF5E5E5E),
    muted: Color(0xFFA3A3A3),
    disabledFg: Color(0xFF5E5E5E),
    accentInk: Color(0xFF4CBE72),
    accentStrong: Color(0xFF74D492),
    accentSurface: Color(0xFF10231A),
    accentLine: Color(0xFF2C6B45),
    danger: Color(0xFFF87171),
    dangerSurface: Color(0xFF1F1010),
    dangerLine: Color(0xFF7F1D1D),
    warning: Color(0xFFFBBF24),
    warningSurface: Color(0xFF1C1408),
    warningLine: Color(0xFF78350F),
    info: Color(0xFF60A5FA),
    infoSurface: Color(0xFF0C1524),
    infoLine: Color(0xFF1E3A8A),
    onConsequence: Color(0xFF000000),
    chart1: Color(0xFF4CBE72),
    chart2: Color(0xFF60A5FA),
    chart3: Color(0xFFFBBF24),
    chart4: Color(0xFFC4B5FD),
    chart5: Color(0xFFF87171),
  );

  /// Map-only literals, kept in sync by hand per the ground rules.
  static const Color mapPrimary = Color(0xFF318549);
  static const Color mapSecondary = Color(0xFF6E6E6E);

  static BasisTokens of(BuildContext context) =>
      Theme.of(context).extension<BasisTokens>()!;

  // Type scale — named getters matching the web utilities exactly.
  // DM Sans everywhere; route numbers use Barlow Condensed via RouteBadge.
  // Weight ladder 400/500/600. 12sp floor. No letter spacing.
  TextStyle get typePageTitle =>
      const TextStyle(fontSize: 28, height: 1.08, fontWeight: FontWeight.w500);
  TextStyle get typeH2 =>
      const TextStyle(fontSize: 26, height: 1.16, fontWeight: FontWeight.w500);
  TextStyle get typeH3 =>
      const TextStyle(fontSize: 20, height: 1.3, fontWeight: FontWeight.w500);
  TextStyle get typeCardTitle =>
      const TextStyle(fontSize: 16, height: 1.35, fontWeight: FontWeight.w600);
  TextStyle get typeMetric => const TextStyle(
      fontSize: 28,
      height: 1.1,
      fontWeight: FontWeight.w500,
      fontFeatures: [FontFeature.tabularFigures()]);
  TextStyle get typeBody =>
      const TextStyle(fontSize: 16, height: 1.6, fontWeight: FontWeight.w400);
  TextStyle get typeBodySm =>
      const TextStyle(fontSize: 14, height: 1.6, fontWeight: FontWeight.w400);
  TextStyle get typeLabel =>
      const TextStyle(fontSize: 13, height: 1.3, fontWeight: FontWeight.w600);
  TextStyle get typeMeta =>
      TextStyle(fontSize: 13, height: 1.55, fontWeight: FontWeight.w400, color: muted);
  TextStyle get typeEyebrow =>
      TextStyle(fontSize: 12, height: 1.4, fontWeight: FontWeight.w500, color: muted);

  static const Curve easeGlide = Cubic(0.22, 1, 0.36, 1);

  @override
  BasisTokens copyWith({
    Color? paper,
    Color? ink,
    Color? surface,
    Color? surfaceHover,
    Color? surfaceSunken,
    Color? line,
    Color? lineStrong,
    Color? muted,
    Color? disabledFg,
    Color? accentInk,
    Color? accentStrong,
    Color? accentSurface,
    Color? accentLine,
    Color? danger,
    Color? dangerSurface,
    Color? dangerLine,
    Color? warning,
    Color? warningSurface,
    Color? warningLine,
    Color? info,
    Color? infoSurface,
    Color? infoLine,
    Color? onConsequence,
    Color? chart1,
    Color? chart2,
    Color? chart3,
    Color? chart4,
    Color? chart5,
  }) {
    return BasisTokens(
      paper: paper ?? this.paper,
      ink: ink ?? this.ink,
      surface: surface ?? this.surface,
      surfaceHover: surfaceHover ?? this.surfaceHover,
      surfaceSunken: surfaceSunken ?? this.surfaceSunken,
      line: line ?? this.line,
      lineStrong: lineStrong ?? this.lineStrong,
      muted: muted ?? this.muted,
      disabledFg: disabledFg ?? this.disabledFg,
      accentInk: accentInk ?? this.accentInk,
      accentStrong: accentStrong ?? this.accentStrong,
      accentSurface: accentSurface ?? this.accentSurface,
      accentLine: accentLine ?? this.accentLine,
      danger: danger ?? this.danger,
      dangerSurface: dangerSurface ?? this.dangerSurface,
      dangerLine: dangerLine ?? this.dangerLine,
      warning: warning ?? this.warning,
      warningSurface: warningSurface ?? this.warningSurface,
      warningLine: warningLine ?? this.warningLine,
      info: info ?? this.info,
      infoSurface: infoSurface ?? this.infoSurface,
      infoLine: infoLine ?? this.infoLine,
      onConsequence: onConsequence ?? this.onConsequence,
      chart1: chart1 ?? this.chart1,
      chart2: chart2 ?? this.chart2,
      chart3: chart3 ?? this.chart3,
      chart4: chart4 ?? this.chart4,
      chart5: chart5 ?? this.chart5,
    );
  }

  @override
  BasisTokens lerp(ThemeExtension<BasisTokens>? other, double t) {
    if (other is! BasisTokens) return this;
    Color lerpColor(Color a, Color b) => Color.lerp(a, b, t)!;
    return BasisTokens(
      paper: lerpColor(paper, other.paper),
      ink: lerpColor(ink, other.ink),
      surface: lerpColor(surface, other.surface),
      surfaceHover: lerpColor(surfaceHover, other.surfaceHover),
      surfaceSunken: lerpColor(surfaceSunken, other.surfaceSunken),
      line: lerpColor(line, other.line),
      lineStrong: lerpColor(lineStrong, other.lineStrong),
      muted: lerpColor(muted, other.muted),
      disabledFg: lerpColor(disabledFg, other.disabledFg),
      accentInk: lerpColor(accentInk, other.accentInk),
      accentStrong: lerpColor(accentStrong, other.accentStrong),
      accentSurface: lerpColor(accentSurface, other.accentSurface),
      accentLine: lerpColor(accentLine, other.accentLine),
      danger: lerpColor(danger, other.danger),
      dangerSurface: lerpColor(dangerSurface, other.dangerSurface),
      dangerLine: lerpColor(dangerLine, other.dangerLine),
      warning: lerpColor(warning, other.warning),
      warningSurface: lerpColor(warningSurface, other.warningSurface),
      warningLine: lerpColor(warningLine, other.warningLine),
      info: lerpColor(info, other.info),
      infoSurface: lerpColor(infoSurface, other.infoSurface),
      infoLine: lerpColor(infoLine, other.infoLine),
      onConsequence: lerpColor(onConsequence, other.onConsequence),
      chart1: lerpColor(chart1, other.chart1),
      chart2: lerpColor(chart2, other.chart2),
      chart3: lerpColor(chart3, other.chart3),
      chart4: lerpColor(chart4, other.chart4),
      chart5: lerpColor(chart5, other.chart5),
    );
  }
}
