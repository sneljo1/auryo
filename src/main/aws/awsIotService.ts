/* eslint-disable camelcase */
import * as awsIot from 'aws-iot-device-sdk';
// eslint-disable-next-line import/no-cycle
import { Logger, LoggerInstance } from '../utils/logger';
// eslint-disable-next-line import/no-cycle
import { GetKeysResponse } from './awsApiGatewayService';

export interface AuthMessage {
  success: boolean;
  token?: TokenResponse;
  error?: {
    error: string;
    error_description: string;
  };
}

export interface TokenResponse {
  access_token: string;
  expires_at: number;
  refresh_token: string;
}

export class AWSIotService {
  public logger: LoggerInstance = Logger.createLogger(AWSIotService.name);
  public device: awsIot.device;
  private readonly identityId: string = '';

  constructor(getKeysResponse: GetKeysResponse) {
    // eslint-disable-next-line new-cap
    this.device = new awsIot.device({
      region: getKeysResponse.region,
      protocol: 'wss',
      // debug: true,
      clientId: getKeysResponse.identityId,
      accessKeyId: getKeysResponse.accessKeyId,
      secretKey: getKeysResponse.secretAccessKey,
      sessionToken: getKeysResponse.sessionToken,
      port: 443,
      host: getKeysResponse.iotEndpoint
    });

    if (getKeysResponse) {
      this.identityId = getKeysResponse.identityId || '';
    }

    this.device.on('error', () => {
      this.logger.error('Error with mqtt');
    });
  }

  public async connect() {
    return new Promise((resolve, reject) => {
      this.device.on('connect', async () => {
        this.logger.debug('Connected to MQTT');
        resolve();
      });
      this.device.on('close', async () => {
        reject(new Error('Disconnected from mqtt'));
      });
    });
  }

  public async disconnect() {
    return new Promise(resolve => {
      this.device.end(true, () => {
        resolve();
      });
    });
  }

  public async subscribe(topic: string, options?: any) {
    return new Promise((resolve, reject) => {
      this.device.subscribe(this.identityId + topic, options, (err, granted) => {
        if (err) {
          reject(err);

          return;
        }

        this.logger.debug(`Subscribed to ${this.identityId + topic}`);

        resolve(granted);
      });
      this.device.on('close', async () => {
        reject(new Error('Disconnected from mqtt'));
      });
    });
  }

  public async waitForMessageOrTimeOut(timeoutMs = 300000) {
    return new Promise<TokenResponse | null>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Login timeout'));
      }, timeoutMs);
      this.device.on('message', (_, payload) => {
        clearTimeout(timeout);

        const message: AuthMessage = JSON.parse(payload.toString('utf8'));

        if (message.success) {
          resolve(message.token);
        } else {
          reject(
            new Error(
              message.error ? `${message.error.error}: ${message.error.error_description}` : 'Error during login'
            )
          );
        }
      });
    });
  }
}
