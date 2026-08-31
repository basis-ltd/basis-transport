import JSZip from 'jszip';

/** Invented GTFS data for tests only. Not an operational Kigali network. */
export async function terminalFeed(
  overrides: Record<string, string | null> = {}
) {
  const files: Record<string, string | null> = {
    'agency.txt':
      'agency_id,agency_name,agency_timezone\na,Synthetic operator,Africa/Kigali',
    'routes.txt':
      'route_id,agency_id,route_short_name,route_long_name\nr,a,TEST,Synthetic terminal service',
    'stops.txt':
      'stop_id,stop_code,stop_name,stop_lat,stop_lon,location_type,parent_station,platform_code\nS,,Synthetic terminal,-1.95,30,1,,\nA,SHARED,Central,-1.95,30,0,S,1\nB,SHARED,Central,-1.95,30.001,0,S,2\nC,C,Destination,-1.95,30.02,0,,',
    'trips.txt':
      'route_id,service_id,trip_id,direction_id\nr,s,out,0\nr,s,back,1',
    'stop_times.txt':
      'trip_id,arrival_time,departure_time,stop_id,stop_sequence\nout,08:00:00,08:00:00,A,1\nout,08:05:00,08:05:00,B,2\nout,08:10:00,08:10:00,C,3\nback,09:00:00,09:00:00,C,1\nback,09:10:00,09:10:00,A,2',
    'calendar.txt':
      'service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\ns,1,1,1,1,1,1,1,20190225,20210225',
    'feed_info.txt':
      'feed_publisher_name,feed_publisher_url,feed_lang,feed_version\nSynthetic publisher,https://example.org, en,fixture-v1',
    'translations.txt':
      'table_name,field_name,language,translation,record_id,field_value\nstops,stop_name,rw,Ihuriro ryikigereranyo,S,\nstops,stop_name,fr,Arrêt central,,Central\nstops,stop_name,fr,Quai un,A,\nstops,stop_name,rw,Ahantu ha mbere,A,',
    ...overrides,
  };
  const zip = new JSZip();
  for (const [name, data] of Object.entries(files))
    if (data !== null) zip.file(name, data);
  return zip.generateAsync({ type: 'nodebuffer' });
}
