// Port of client/src/features/journey/types.ts — journey planning models.
// Field names and nullability are kept identical to the web types.

typedef Coordinates = List<double>;

class JourneyLocation {
  final String? stopId;
  final double latitude;
  final double longitude;
  final String name;
  final String? placeId;

  const JourneyLocation({
    this.stopId,
    required this.latitude,
    required this.longitude,
    required this.name,
    this.placeId,
  });

  factory JourneyLocation.fromJson(Map<String, dynamic> json) =>
      JourneyLocation(
        stopId: json['stopId'] as String?,
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
        name: json['name'] as String,
        placeId: json['placeId'] as String?,
      );

  Map<String, dynamic> toJson() => {
        if (stopId != null) 'stopId': stopId,
        'latitude': latitude,
        'longitude': longitude,
        'name': name,
        if (placeId != null) 'placeId': placeId,
      };
}

class ResolvedLocation {
  final String name;
  final Coordinates coordinates;
  final String? stopId;

  const ResolvedLocation({
    required this.name,
    required this.coordinates,
    this.stopId,
  });

  factory ResolvedLocation.fromJson(Map<String, dynamic> json) =>
      ResolvedLocation(
        name: json['name'] as String,
        coordinates: (json['coordinates'] as List)
            .map((e) => (e as num).toDouble())
            .toList(),
        stopId: json['stopId'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'name': name,
        'coordinates': coordinates,
        if (stopId != null) 'stopId': stopId,
      };
}

abstract class JourneyLeg {
  String get kind;
}

class WalkLeg implements JourneyLeg {
  @override
  final String kind = 'walk';
  final ResolvedLocation from;
  final ResolvedLocation to;
  final int distanceMeters;
  final int? durationSeconds;
  final CoordinatesList geometry;
  final List<String> instructions;
  final String quality;

  const WalkLeg({
    required this.from,
    required this.to,
    required this.distanceMeters,
    required this.durationSeconds,
    required this.geometry,
    required this.instructions,
    required this.quality,
  });

  factory WalkLeg.fromJson(Map<String, dynamic> json) => WalkLeg(
        from: ResolvedLocation.fromJson(json['from']),
        to: ResolvedLocation.fromJson(json['to']),
        distanceMeters: json['distanceMeters'] as int,
        durationSeconds: json['durationSeconds'] as int?,
        geometry: _coords(json['geometry']),
        instructions:
            (json['instructions'] as List).map((e) => e as String).toList(),
        quality: json['quality'] as String,
      );
}

typedef CoordinatesList = List<Coordinates>;

CoordinatesList _coords(dynamic v) => (v as List)
    .map((e) => (e as List).map((x) => (x as num).toDouble()).toList())
    .toList();

class RideLeg implements JourneyLeg {
  @override
  final String kind = 'ride';
  final String patternId;
  final String routeId;
  final String routeNumber;
  final String agency;
  final String headsign;
  final PatternStop board;
  final PatternStop alight;
  final List<PatternStop> stops;
  final int distanceMeters;
  final int? durationSeconds;
  final CoordinatesList geometry;
  final String geometryQuality;
  final Fare? fare;

  const RideLeg({
    required this.patternId,
    required this.routeId,
    required this.routeNumber,
    required this.agency,
    required this.headsign,
    required this.board,
    required this.alight,
    required this.stops,
    required this.distanceMeters,
    required this.durationSeconds,
    required this.geometry,
    required this.geometryQuality,
    required this.fare,
  });

  factory RideLeg.fromJson(Map<String, dynamic> json) => RideLeg(
        patternId: json['patternId'] as String,
        routeId: json['routeId'] as String,
        routeNumber: json['routeNumber'] as String,
        agency: json['agency'] as String,
        headsign: json['headsign'] as String,
        board: PatternStop.fromJson(json['board']),
        alight: PatternStop.fromJson(json['alight']),
        stops: (json['stops'] as List).map((e) => PatternStop.fromJson(e)).toList(),
        distanceMeters: json['distanceMeters'] as int,
        durationSeconds: json['durationSeconds'] as int?,
        geometry: _coords(json['geometry']),
        geometryQuality: json['geometryQuality'] as String,
        fare: json['fare'] == null ? null : Fare.fromJson(json['fare']),
      );
}

JourneyLeg journeyLegFromJson(Map<String, dynamic> json) =>
    json['kind'] == 'walk'
        ? WalkLeg.fromJson(json)
        : RideLeg.fromJson(json);

class Fare {
  final double amount;
  final String currency;
  final String sourceUrl;
  final String validFrom;
  final String validTo;
  final bool verified;

  const Fare({
    required this.amount,
    required this.currency,
    required this.sourceUrl,
    required this.validFrom,
    required this.validTo,
    required this.verified,
  });

  factory Fare.fromJson(Map<String, dynamic> json) => Fare(
        amount: (json['amount'] as num).toDouble(),
        currency: json['currency'] as String,
        sourceUrl: json['sourceUrl'] as String,
        validFrom: json['validFrom'] as String,
        validTo: json['validTo'] as String,
        verified: json['verified'] as bool,
      );

  Map<String, dynamic> toJson() => {
        'amount': amount,
        'currency': currency,
        'sourceUrl': sourceUrl,
        'validFrom': validFrom,
        'validTo': validTo,
        'verified': verified,
      };
}

class FareQuoteLeg {
  final int legIndex;
  final double? amount;
  final String? paymentTiming;
  final String? instructions;

  const FareQuoteLeg({
    required this.legIndex,
    required this.amount,
    required this.paymentTiming,
    required this.instructions,
  });

  factory FareQuoteLeg.fromJson(Map<String, dynamic> json) => FareQuoteLeg(
        legIndex: json['legIndex'] as int,
        amount: (json['amount'] as num?)?.toDouble(),
        paymentTiming: json['paymentTiming'] as String?,
        instructions: json['instructions'] as String?,
      );
}

class FareQuote {
  final String status;
  final List<FareQuoteLeg> legFares;
  final List<Map<String, dynamic>> transferAdjustments;
  final double? subtotal;
  final double? total;
  final List<String>? warnings;

  const FareQuote({
    required this.status,
    required this.legFares,
    required this.transferAdjustments,
    required this.subtotal,
    required this.total,
    this.warnings,
  });

  factory FareQuote.fromJson(Map<String, dynamic> json) => FareQuote(
        status: json['status'] as String,
        legFares: (json['legFares'] as List)
            .map((e) => FareQuoteLeg.fromJson(e))
            .toList(),
        transferAdjustments: (json['transferAdjustments'] as List)
            .map((e) => e as Map<String, dynamic>)
            .toList(),
        subtotal: (json['subtotal'] as num?)?.toDouble(),
        total: (json['total'] as num?)?.toDouble(),
        warnings: (json['warnings'] as List?)?.map((e) => e as String).toList(),
      );
}

class PassengerStep {
  final String id;
  final String kind;
  final int? legIndex;
  final Map<String, dynamic>? location;
  final String text;
  final String confidence;
  final Map<String, dynamic> timing;
  final double? fareAmount;
  final String? fareCurrency;
  final String? paymentTiming;
  final String? paymentInstructions;

  const PassengerStep({
    required this.id,
    required this.kind,
    required this.legIndex,
    this.location,
    required this.text,
    required this.confidence,
    required this.timing,
    required this.fareAmount,
    required this.fareCurrency,
    required this.paymentTiming,
    required this.paymentInstructions,
  });

  factory PassengerStep.fromJson(Map<String, dynamic> json) => PassengerStep(
        id: json['id'] as String,
        kind: json['kind'] as String,
        legIndex: json['legIndex'] as int?,
        location: json['location'] as Map<String, dynamic>?,
        text: json['text'] as String,
        confidence: json['confidence'] as String,
        timing: json['timing'] as Map<String, dynamic>,
        fareAmount: (json['fareAmount'] as num?)?.toDouble(),
        fareCurrency: json['fareCurrency'] as String?,
        paymentTiming: json['paymentTiming'] as String?,
        paymentInstructions: json['paymentInstructions'] as String?,
      );
}

class Journey {
  final String id;
  final List<JourneyLeg> legs;
  final List<PassengerStep>? steps;
  final int transfers;
  final int walkingMeters;
  final int ridingMeters;
  final int? durationSeconds;
  final double? fareRwf;
  final FareQuote? fareQuote;
  final String? timingStatus;
  final String? arrivalAt;

  const Journey({
    required this.id,
    required this.legs,
    this.steps,
    required this.transfers,
    required this.walkingMeters,
    required this.ridingMeters,
    required this.durationSeconds,
    required this.fareRwf,
    this.fareQuote,
    this.timingStatus,
    this.arrivalAt,
  });

  factory Journey.fromJson(Map<String, dynamic> json) => Journey(
        id: json['id'] as String,
        legs: (json['legs'] as List)
            .map((e) => journeyLegFromJson(e as Map<String, dynamic>))
            .toList(),
        steps: (json['steps'] as List?)
            ?.map((e) => PassengerStep.fromJson(e))
            .toList(),
        transfers: json['transfers'] as int,
        walkingMeters: json['walkingMeters'] as int,
        ridingMeters: json['ridingMeters'] as int,
        durationSeconds: json['durationSeconds'] as int?,
        fareRwf: (json['fareRwf'] as num?)?.toDouble(),
        fareQuote: json['fareQuote'] == null
            ? null
            : FareQuote.fromJson(json['fareQuote']),
        timingStatus: json['timingStatus'] as String?,
        arrivalAt: json['arrivalAt'] as String?,
      );
}

class JourneyPlan {
  final String? validFrom;
  final String? validTo;
  final String? departureAt;
  final String status;
  final String datasetVersion;
  final String verification;
  final String sourceUrl;
  final ResolvedLocation origin;
  final ResolvedLocation destination;
  final List<Journey> journeys;
  final List<Map<String, dynamic>>? nearbyConnections;
  final List<String> warnings;

  const JourneyPlan({
    required this.validFrom,
    required this.validTo,
    this.departureAt,
    required this.status,
    required this.datasetVersion,
    required this.verification,
    required this.sourceUrl,
    required this.origin,
    required this.destination,
    required this.journeys,
    this.nearbyConnections,
    required this.warnings,
  });

  factory JourneyPlan.fromJson(Map<String, dynamic> json) => JourneyPlan(
        validFrom: json['validFrom'] as String?,
        validTo: json['validTo'] as String?,
        departureAt: json['departureAt'] as String?,
        status: json['status'] as String,
        datasetVersion: json['datasetVersion'] as String,
        verification: json['verification'] as String,
        sourceUrl: json['sourceUrl'] as String,
        origin: ResolvedLocation.fromJson(json['origin']),
        destination: ResolvedLocation.fromJson(json['destination']),
        journeys: (json['journeys'] as List)
            .map((e) => Journey.fromJson(e as Map<String, dynamic>))
            .toList(),
        nearbyConnections: (json['nearbyConnections'] as List?)
            ?.map((e) => e as Map<String, dynamic>)
            .toList(),
        warnings:
            (json['warnings'] as List).map((e) => e as String).toList(),
      );
}

class SavedItem {
  final String? id;
  final String key;
  final String label;
  final String href;
  final String kind;

  const SavedItem({
    this.id,
    required this.key,
    required this.label,
    required this.href,
    required this.kind,
  });

  factory SavedItem.fromJson(Map<String, dynamic> json) => SavedItem(
        id: json['id'] as String?,
        key: json['key'] as String,
        label: json['label'] as String,
        href: json['href'] as String,
        kind: json['kind'] as String,
      );

  Map<String, dynamic> toJson() => {
        if (id != null) 'id': id,
        'key': key,
        'label': label,
        'href': href,
        'kind': kind,
      };
}

class PatternStop {
  final String id; final String code; final String name;
  final Coordinates coordinates; final int sequence;
  final int sourceSequence; final int? elapsedSeconds; final int? shapeIndex;
  const PatternStop({required this.id, required this.code, required this.name, required this.coordinates, required this.sequence, required this.sourceSequence, this.elapsedSeconds, this.shapeIndex});
  factory PatternStop.fromJson(Map<String, dynamic> j) => PatternStop(
    id: j['id'] as String, code: (j['code'] ?? '') as String, name: (j['name'] ?? '') as String,
    coordinates: (j['coordinates'] as List).map((e) => (e as num).toDouble()).toList(),
    sequence: (j['sequence'] ?? 0) as int, sourceSequence: (j['sourceSequence'] ?? 0) as int,
    elapsedSeconds: j['elapsedSeconds'] as int?, shapeIndex: j['shapeIndex'] as int?);
}
