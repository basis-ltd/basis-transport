import 'package:flutter/material.dart';
import 'tokens.dart';

/// Assembles [ThemeData] for light and dark from the `:root` and `.dark`
/// blocks of `client/src/index.css`. Follows the system setting via
/// `themeMode: ThemeMode.system` in [BasisApp].
class BasisTheme {
  const BasisTheme._();

  static ThemeData get light => _build(BasisTokens.light, Brightness.light);
  static ThemeData get dark => _build(BasisTokens.dark, Brightness.dark);

  static ThemeData _build(BasisTokens t, Brightness brightness) {
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      fontFamily: 'DMSans',
      scaffoldBackgroundColor: t.paper,
      colorScheme: ColorScheme(
        brightness: brightness,
        primary: t.ink,
        onPrimary: t.paper,
        secondary: t.surface,
        onSecondary: t.ink,
        error: t.danger,
        onError: t.onConsequence,
        surface: t.paper,
        onSurface: t.ink,
      ),
      extensions: [t],
      appBarTheme: AppBarTheme(
        backgroundColor: t.paper,
        foregroundColor: t.ink,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      cardTheme: CardThemeData(
        color: t.paper,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(t.radiusCard),
          side: BorderSide(color: t.line),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: t.paper,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(t.radiusCard),
          side: BorderSide(color: t.line),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: t.paper,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(t.radiusControl),
          borderSide: BorderSide(color: t.line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(t.radiusControl),
          borderSide: BorderSide(color: t.line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(t.radiusControl),
          borderSide: BorderSide(color: t.ink),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(t.radiusControl),
          borderSide: BorderSide(color: t.danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(t.radiusControl),
          borderSide: BorderSide(color: t.danger),
        ),
        labelStyle: TextStyle(color: t.muted),
        hintStyle: TextStyle(color: t.muted),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ButtonStyle(
          minimumSize: WidgetStatePropertyAll(Size(0, t.controlMd)),
          shape: WidgetStatePropertyAll(RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(t.radiusControl))),
          backgroundColor: WidgetStatePropertyAll(t.ink),
          foregroundColor: WidgetStatePropertyAll(t.paper),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: ButtonStyle(
          minimumSize: WidgetStatePropertyAll(Size(0, t.controlMd)),
          shape: WidgetStatePropertyAll(RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(t.radiusControl))),
          side: WidgetStatePropertyAll(BorderSide(color: t.line)),
          foregroundColor: WidgetStatePropertyAll(t.ink),
        ),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: t.paper,
        selectedItemColor: t.accentInk,
        unselectedItemColor: t.muted,
      ),
    );
  }
}
