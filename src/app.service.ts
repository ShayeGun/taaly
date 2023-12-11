import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  async getToken() {
    const basicAuth = Buffer.from(`${this.configService.get<string>('TALLY_GATEWAY_USERNAME')}:${this.configService.get<string>('TALLY_GATEWAY_PASSWORD')}`, 'utf-8').toString('base64') + '=';

    const headers = {
      Authorization: `Basic ${basicAuth}`,
      accept: "application/json",
      'Content-Type': 'application/json'
    };

    console.log(basicAuth);


    const response = await this.httpService.axiosRef
      .post(
        `${this.configService.get('TALLY_GATEWAY_BASE_URL')}/api/v1/Token`,
        {
          "amount": 10000,
          "redirectUri": "https://callback.taaly.core.evip-club.org",
          "terminalId": 2294,
          "uniqueIdentifier": `${Date.now()}`
        },
        {
          headers
        }
      )
      .then((res) => {
        console.log(res.data);

        return res.data;
      })
      .catch((err) => {
        console.log(err.response);

        throw new BadRequestException(err.response.data.errMsg);
      });

    return response;
  }

  async getIp() {
    const response = await this.httpService.axiosRef
      .get('https://api.ipify.org')
      .then((res) => {

        console.log("-----------------");
        console.log(res.data);

        return res.data;
      })
      .catch((err) => {
        console.log("======================");
        console.log(err.response);

        throw new BadRequestException(err);
      });

    return response;
  }
}
