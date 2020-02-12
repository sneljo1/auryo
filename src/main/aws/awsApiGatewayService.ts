import * as aws4 from 'aws4';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { CONFIG } from '../../config';
// eslint-disable-next-line import/no-cycle
import { Logger, LoggerInstance } from '../utils/logger';
// eslint-disable-next-line import/no-cycle
import { TokenResponse } from './awsIotService';

export interface GetKeysResponse {
  iotEndpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  identityId: string;
}

export class AWSApiGatewayService {
  public logger: LoggerInstance = Logger.createLogger(AWSApiGatewayService.name);
  private keys: GetKeysResponse;

  public async getKeys() {
    this.keys = await axios.get<GetKeysResponse>(`${CONFIG.AWS_API_URL}/iot/keys`).then(res => res.data);

    return this.keys;
  }

  public async refresh(refreshToken: string, provider: string) {
    await this.getKeys();

    return this.performRequest<TokenResponse>(`/auth/refresh/${provider}`, 'POST', { refreshToken }).then(
      res => res.data
    );
  }

  public async performRequest<T>(path: string, method: Method = 'GET', body?: object) {
    const signedRequest = this.prepareRequest(path, method, body);

    return axios.request<T>({
      ...signedRequest,
      data: body
    });
  }

  public prepareRequest(
    path: string,
    method: Method = 'GET',
    body?: object
  ): { host: string; path: string; headers: any } {
    const host = CONFIG.AWS_API_URL.match(/[a-z0-9.-]*.com/g);

    const request: Partial<AxiosRequestConfig & { host: string; path: string; body: string }> = {
      host: host && host.length ? host[0] : '',
      method,
      url: CONFIG.AWS_API_URL + path,
      path: `${CONFIG.AWS_API_URL}${path}`.split('auryo.com')[1],
      headers: {}
    };

    if (body) {
      request.body = JSON.stringify(body);
      request.data = body;
      request.headers['Content-Type'] = 'application/json';
    }

    const signedRequest = aws4.sign(
      {
        ...request,
        region: 'eu-west-1',
        service: 'execute-api'
      },
      {
        secretAccessKey: this.keys.secretAccessKey,
        accessKeyId: this.keys.accessKeyId,
        sessionToken: this.keys.sessionToken
      }
    );

    delete signedRequest.headers.Host;
    delete signedRequest.headers['Content-Length'];

    return signedRequest;
  }
}
