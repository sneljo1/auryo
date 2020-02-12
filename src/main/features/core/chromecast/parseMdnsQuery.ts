import { ChromeCastDevice, GoogleDeviceModel } from '@common/store/app';

export type Nullable<T> = { [P in keyof T]: T[P] | null };

// these interfaces are incomplete and only type the relevant
// parts of the response
interface MDNSResponse {
  additionals: Response<MDNSRecordType>[];
}

interface Response<T> {
  name: string;
  type: T;
  ttl: number;
  data: T extends 'A' ? string : T extends 'TXT' ? Buffer[] : T extends 'SRV' ? { port: number } : undefined;
}

interface CastDeviceResponse {
  A: Response<'A'>;
  SRV: Response<'SRV'>;
  TXT: Response<'TXT'>;
}

export function objectFromKeyValuePairs(keyValuePairs: string[]): { [key: string]: string } {
  return keyValuePairs.reduce((all, pair) => {
    const idx = pair.indexOf('=');
    const key = pair.substring(0, idx);
    const value = pair.substring(idx + 1);
    return {
      ...all,
      [key]: value
    };
  }, {});
}

// Records can have any valid DNS record type but these
// are the only ones we care about. For a full list, see
// here: https://en.wikipedia.org/wiki/List_of_DNS_record_types
type MDNSRecordType = 'A' | 'SRV' | 'TXT';

export function validateCastResponse({ additionals }: MDNSResponse): CastDeviceResponse | null {
  const records: Nullable<CastDeviceResponse> = {
    A: null,
    SRV: null,
    TXT: null
  };

  additionals.forEach(record => {
    switch (record.type) {
      case 'A':
        records.A = record as Response<'A'>;
        break;
      case 'SRV':
        if (!record.name.match(/\._googlecast\._tcp\.local$/)) {
          break;
        }
        records.SRV = record as Response<'SRV'>;
        break;
      case 'TXT':
        records.TXT = record as Response<'TXT'>;
        break;
      default:
    }
  });

  return records.A && records.SRV && records.TXT ? (records as CastDeviceResponse) : null;
}

export function parseResponse(res: MDNSResponse): ChromeCastDevice | null {
  // Cast-enabled devices will always broadcast 3 records
  // - A: used to determine the device's IP address
  // - SRV: used to determine the device's Cast port
  // - TXT: used to determine various additional info about the device
  //
  // Our mDNS interface will log *any* mDNS query/response broadcasts,
  // but we only care about those that we initiate, so we'll ignore
  // all those that don't match the recordset described above. Further,
  // it's possible that some other mDNS service also broadcasts an A/SRV/TEXT
  // record, so we'll double check that the SRV record matches the `googlecast`
  // TCP namespace.
  const records = validateCastResponse(res);
  if (!records) {
    return null;
  }

  const kvp = records.TXT.data.map(buf => buf.toString('utf-8'));
  const info = objectFromKeyValuePairs(kvp);

  return {
    id: info.id,
    name: info.fn,
    model: info.md as GoogleDeviceModel,
    address: records.A.data,
    port: records.SRV.data.port,
    status: 'online'
  };
}
