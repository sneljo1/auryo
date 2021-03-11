import _ from 'lodash';

export function filter(str: string) {
  return str.replace(/\[(.*?)]/g, '');
}

export function abbreviateNumber(num: number, fixed?: number) {
  if (_.isNil(num) || !num || num === 0) {
    return '0';
  } // terminate early

  const toFixed = fixed || 0; // number of decimal places to show
  const b = num.toPrecision(2).split('e');
  // get power

  const k = b.length === 1 ? 0 : Math.floor(Math.min((b[1] as any).slice(1), 14) / 3);
  // floor at decimals, ceiling at trillions

  const c = k < 1 ? num.toFixed(0 + toFixed) : (num / 10 ** (k * 3)).toFixed(1 + toFixed);
  // divide by power

  const d = (c as any) < 0 ? c : Math.abs(c as any);

  return d + ['', 'K', 'M', 'B', 'T'][k]; // append power
}

export function getReadableTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);

  // eslint-disable-next-line no-nested-ternary
  return [h, m > 9 ? m : h ? `0${m}` : m || '0', s > 9 ? s : `0${s}`].filter(Boolean).join(':');
}

export function getReadableTimeFull(sec: number, inMs?: boolean) {
  if (!sec) {
    return '0min.';
  }

  // Get hours from milliseconds
  let hours = sec / (60 * 60);
  if (inMs) {
    hours = sec / (60 * 60 * 1000);
  }
  const h = Math.floor(hours);

  // Get remainder from hours and convert to minutes
  const minutes = (hours - h) * 60;
  const m = Math.floor(minutes);

  let str = '';

  if (h !== 0) {
    str += `${h}h ${m}min.`;
  } else {
    str += `${m}min.`;
  }

  return str;
}

export function isSoundCloudUrl(query: string) {
  return /https?:\/\/(www.)?soundcloud\.com\//g.exec(query) !== null;
}
