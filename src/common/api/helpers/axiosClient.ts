import axios from 'axios';
import is from 'electron-is';

export const axiosClient = axios.create({
  // eslint-disable-next-line global-require
  adapter: is.dev() && require('axios/lib/adapters/http')
});
