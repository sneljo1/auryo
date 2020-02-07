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

export function getReadableTime(sec: number, ms: boolean, withSeconds: boolean) {
  if (!sec) {
    return '00:00';
  }

  // Get hours from milliseconds
  let hours = sec / (60 * 60);
  if (ms) {
    hours = sec / (60 * 60 * 1000);
  }
  const absoluteHours = Math.floor(hours);
  const h = absoluteHours > 9 ? absoluteHours : `0${absoluteHours}`;

  // Get remainder from hours and convert to minutes
  const minutes = (hours - absoluteHours) * 60;
  const absoluteMinutes = Math.floor(minutes);
  const m = absoluteMinutes > 9 ? absoluteMinutes : `0${absoluteMinutes}`;

  // Get remainder from minutes and convert to seconds
  const seconds = (minutes - absoluteMinutes) * 60;
  const absoluteSeconds = Math.floor(seconds);
  const s = absoluteSeconds > 9 ? absoluteSeconds : `0${absoluteSeconds}`;

  let str = '';

  if (h !== '00') {
    str += `${h}:${m}${withSeconds ? `:${s}` : ''}`;
  } else {
    str += `${m}:${s}`;
  }

  return str;
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
