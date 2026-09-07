// Port of network-related types from client/src/features/journey/types.ts.
import 'journey.dart';

class NetworkMetadata {
  final String version; final String source; final String sourceUrl;
  final String verification; final String rightsStatus;
  final String? validFrom; final String? validTo;
  const NetworkMetadata({required this.version, required this.source, required this.sourceUrl, required this.verification, required this.rightsStatus, this.validFrom, this.validTo});
  factory NetworkMetadata.fromJson(Map<String, dynamic> j) => NetworkMetadata(
    version: (j['version'] ?? j['datasetVersion'] ?? '') as String,
    source: (j['source'] ?? '') as String, sourceUrl: (j['sourceUrl'] ?? '') as String,
    verification: (j['verification'] ?? 'unverified') as String,
    rightsStatus: (j['rightsStatus'] ?? '') as String,
    validFrom: j['validFrom'] as String?, validTo: j['validTo'] as String?);
}

class NetworkStatus {
  final bool ready; final String mode; final int routes; final int stops;
  final int patterns; final bool walkingAvailable; final String notice;
  final String? version; final String? source; final String? sourceUrl;
  final String? verification; final String? validFrom; final String? validTo;
  const NetworkStatus({required this.ready, required this.mode, required this.routes, required this.stops, required this.patterns, required this.walkingAvailable, required this.notice, this.version, this.source, this.sourceUrl, this.verification, this.validFrom, this.validTo});
  factory NetworkStatus.fromJson(Map<String, dynamic> j) => NetworkStatus(
    ready: (j['ready'] ?? false) as bool, mode: (j['mode'] ?? '') as String,
    routes: (j['routes'] ?? 0) as int, stops: (j['stops'] ?? 0) as int,
    patterns: (j['patterns'] ?? 0) as int,
    walkingAvailable: (j['walkingAvailable'] ?? false) as bool,
    notice: (j['notice'] ?? '') as String, version: j['version'] as String?,
    source: j['source'] as String?, sourceUrl: j['sourceUrl'] as String?,
    verification: j['verification'] as String?,
    validFrom: j['validFrom'] as String?, validTo: j['validTo'] as String?);
}

class RouteSummary {
  final String id; final String shortName; final String longName; final String agency; final int patterns;
  const RouteSummary({required this.id, required this.shortName, required this.longName, required this.agency, required this.patterns});
  factory RouteSummary.fromJson(Map<String, dynamic> j) => RouteSummary(
    id: j['id'] as String, shortName: (j['shortName'] ?? '') as String,
    longName: (j['longName'] ?? '') as String, agency: (j['agency'] ?? '') as String,
    patterns: (j['patterns'] is int) ? j['patterns'] as int : 0);
}

class NetworkStop {
  final String id; final String code; final String name;
  final List<String> aliases; final Coordinates coordinates;
  final int? distanceMeters; final List<String>? routeNumbers;
  final String? platformCode; final int? boardingPointCount;
  const NetworkStop({required this.id, required this.code, required this.name, required this.aliases, required this.coordinates, this.distanceMeters, this.routeNumbers, this.platformCode, this.boardingPointCount});
  factory NetworkStop.fromJson(Map<String, dynamic> j) => NetworkStop(
    id: j['id'] as String, code: (j['code'] ?? '') as String, name: (j['name'] ?? '') as String,
    aliases: ((j['aliases'] as List?) ?? []).map((e) => e as String).toList(),
    coordinates: (j['coordinates'] as List).map((e) => (e as num).toDouble()).toList(),
    distanceMeters: j['distanceMeters'] as int?,
    routeNumbers: (j['routeNumbers'] as List?)?.map((e) => e as String).toList(),
    platformCode: j['platformCode'] as String?, boardingPointCount: j['boardingPointCount'] as int?);
}

class PageResult<T> {
  final List<T> rows; final int totalCount; final int totalPages; final int currentPage;
  const PageResult({required this.rows, required this.totalCount, required this.totalPages, required this.currentPage});
}

class RouteDetail {
  final String id; final String shortName; final String longName; final String agency;
  final List<Map<String, dynamic>> patterns; final NetworkMetadata network;
  const RouteDetail({required this.id, required this.shortName, required this.longName, required this.agency, required this.patterns, required this.network});
  factory RouteDetail.fromJson(Map<String, dynamic> j) => RouteDetail(
    id: j['id'] as String, shortName: (j['shortName'] ?? '') as String,
    longName: (j['longName'] ?? '') as String, agency: (j['agency'] ?? '') as String,
    patterns: ((j['patterns'] as List?) ?? []).map((e) => e as Map<String, dynamic>).toList(),
    network: NetworkMetadata.fromJson((j['network'] ?? {}) as Map<String, dynamic>));
}

class StopDetail {
  final NetworkStop stop; final List<RouteSummary> routes; final NetworkMetadata network;
  final List<Map<String, dynamic>> boardingPoints;
  const StopDetail({required this.stop, required this.routes, required this.network, this.boardingPoints = const []});
  factory StopDetail.fromJson(Map<String, dynamic> j) => StopDetail(
    stop: NetworkStop.fromJson(j),
    routes: ((j['routes'] as List?) ?? []).map((e) => RouteSummary.fromJson(e)).toList(),
    network: NetworkMetadata.fromJson((j['network'] ?? {}) as Map<String, dynamic>),
    boardingPoints: ((j['stopArea'] is Map ? (j['stopArea']['boardingPoints'] as List?) : null) ?? []).map((e) => e as Map<String, dynamic>).toList());
}

class DatasetIssue { final String reference; final String message; final String severity;
  const DatasetIssue({required this.reference, required this.message, required this.severity});
  factory DatasetIssue.fromJson(Map<String, dynamic> j) => DatasetIssue(reference: (j['reference'] ?? '') as String, message: (j['message'] ?? '') as String, severity: (j['severity'] ?? '') as String);
}

class Dataset {
  final String id; final String status; final String checksum;
  final String rightsEvidence; final String verificationEvidence;
  final String importedAt; final List<DatasetIssue> issues;
  final String version; final String source;
  const Dataset({required this.id, required this.status, required this.checksum, required this.rightsEvidence, required this.verificationEvidence, required this.importedAt, required this.issues, required this.version, required this.source});
  factory Dataset.fromJson(Map<String, dynamic> j) => Dataset(
    id: (j['id'] ?? '') as String, status: (j['status'] ?? '') as String,
    checksum: (j['checksum'] ?? '') as String, rightsEvidence: (j['rightsEvidence'] ?? '') as String,
    verificationEvidence: (j['verificationEvidence'] ?? '') as String,
    importedAt: (j['importedAt'] ?? '') as String,
    version: (j['version'] ?? '') as String, source: (j['source'] ?? '') as String,
    issues: ((j['issues'] as List?) ?? []).map((e) => DatasetIssue.fromJson(e)).toList());
}

class PassengerReport {
  final String id; final String kind; final String? referenceId; final String message;
  final String? email; final String? name; final String status; final String createdAt;
  const PassengerReport({required this.id, required this.kind, this.referenceId, required this.message, this.email, this.name, required this.status, required this.createdAt});
  factory PassengerReport.fromJson(Map<String, dynamic> j) => PassengerReport(
    id: j['id'] as String, kind: (j['kind'] ?? '') as String, referenceId: j['referenceId'] as String?,
    message: (j['message'] ?? '') as String, email: j['email'] as String?, name: j['name'] as String?,
    status: (j['status'] ?? '') as String, createdAt: (j['createdAt'] ?? '') as String);
  Map<String, dynamic> toJson() => {'kind': kind, if (referenceId != null) 'referenceId': referenceId, 'message': message, if (email != null) 'email': email, if (name != null) 'name': name};
}
