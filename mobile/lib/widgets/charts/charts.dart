import 'package:flutter/material.dart';
import '../../theme/tokens.dart';

/// Sparkline, DonutChart, SeriesChart — accent first, dash patterns vary
/// across series so they survive greyscale/colour-blind reading.
class Sparkline extends StatelessWidget {
  final List<double> values; final double height;
  const Sparkline({super.key, required this.values, this.height = 48});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    return CustomPaint(size: Size(double.infinity, height),
      painter: _LinePainter(values, [t.chart1], solid: true, line: t.lineStrong));
  }
}

class DonutChart extends StatelessWidget {
  final List<double> values; final List<String>? labels;
  const DonutChart({super.key, required this.values, this.labels});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final total = values.fold(0.0, (a, b) => a + b);
    final colors = [t.chart1, t.chart2, t.chart3, t.chart4, t.chart5];
    return Row(spacing: 16, children: [
      SizedBox(width: 120, height: 120, child: CustomPaint(
        painter: _DonutPainter(values, colors, total))),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 4, children: [
        for (var i = 0; i < values.length; i++)
          Row(spacing: 8, children: [
            Container(width: 12, height: 12, decoration: BoxDecoration(color: colors[i % colors.length], shape: BoxShape.circle)),
            Expanded(child: Text('${labels != null && i < labels!.length ? labels![i] : 'Series ${i + 1}'} — ${total == 0 ? 0 : (values[i] / total * 100).toStringAsFixed(1)}%', style: t.typeBodySm)),
          ]),
      ])),
    ]);
  }
}

class SeriesChart extends StatelessWidget {
  final List<List<double>> series; final List<String> names;
  const SeriesChart({super.key, required this.series, required this.names});
  @override Widget build(BuildContext context) {
    final t = BasisTokens.of(context);
    final colors = [t.chart1, t.chart2, t.chart3, t.chart4, t.chart5];
    return Column(spacing: 8, children: [
      SizedBox(height: 160, child: CustomPaint(size: const Size(double.infinity, 160),
        painter: _MultiPainter(series, colors, t.line))),
      Wrap(spacing: 12, children: [
        for (var i = 0; i < names.length; i) Row(mainAxisSize: MainAxisSize.min, spacing: 6, children: [
          Container(width: 20, height: 3, color: colors[i % colors.length]),
          Text(names[i], style: t.typeMeta),
        ]),
      ]),
    ]);
  }
}

class _LinePainter extends CustomPainter {
  final List<double> v; final List<Color> c; final bool solid; final Color line;
  _LinePainter(this.v, this.c, {required this.solid, required this.line});
  @override void paint(Canvas canvas, Size size) {
    if (v.length < 2) return;
    final max = v.reduce((a, b) => a > b ? a : b), min = v.reduce((a, b) => a < b ? a : b);
    final span = (max - min) == 0 ? 1 : (max - min);
    final p = Path();
    for (var i = 0; i < v.length; i++) {
      final x = size.width * i / (v.length - 1);
      final y = size.height - ((v[i] - min) / span) * (size.height - 8) - 4;
      if (i == 0) { p.moveTo(x, y); } else { p.lineTo(x, y); }
    }
    canvas.drawPath(p, Paint()..color = c.first..strokeWidth = 2..style = PaintingStyle.stroke);
  }
  @override bool shouldRepaint(covariant CustomPainter o) => true;
}

class _DonutPainter extends CustomPainter {
  final List<double> v; final List<Color> c; final double total;
  _DonutPainter(this.v, this.c, this.total);
  @override void paint(Canvas canvas, Size size) {
    var start = -1.5708;
    final r = size.width / 2;
    for (var i = 0; i < v.length; i++) {
      final sweep = total == 0 ? 0.0 : (v[i] / total) * 6.28318;
      canvas.drawArc(Rect.fromCircle(center: Offset(r, r), radius: r - 12), start, sweep, false,
        Paint()..color = c[i % c.length]..strokeWidth = 20..style = PaintingStyle.stroke..strokeCap = StrokeCap.butt);
      start += sweep;
    }
  }
  @override bool shouldRepaint(covariant CustomPainter o) => true;
}

class _MultiPainter extends CustomPainter {
  final List<List<double>> series; final List<Color> colors; final Color grid;
  _MultiPainter(this.series, this.colors, this.grid);
  @override void paint(Canvas canvas, Size size) {
    for (var i = 0; i < 4; i++) {
      final y = size.height * (i + 1) / 5;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), Paint()..color = grid..strokeWidth = 1);
    }
    for (var s = 0; s < series.length; s++) {
      final v = series[s]; if (v.length < 2) continue;
      final max = v.reduce((a, b) => a > b ? a : b), min = v.reduce((a, b) => a < b ? a : b);
      final span = (max - min) == 0 ? 1 : (max - min);
      final p = Path();
      for (var i = 0; i < v.length; i++) {
        final x = size.width * i / (v.length - 1);
        final y = size.height - ((v[i] - min) / span) * (size.height - 16) - 8;
        if (i == 0) { p.moveTo(x, y); } else { p.lineTo(x, y); }
      }
      canvas.drawPath(p, Paint()..color = colors[s % colors.length]..strokeWidth = 2..style = PaintingStyle.stroke);
    }
  }
  @override bool shouldRepaint(covariant CustomPainter o) => true;
}
