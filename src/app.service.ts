import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { Taaly } from './schema/taaly.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(Taaly.name) private taalyModel: Model<Taaly>
  ) { }

  private async getToken(amount: number, uuid: string) {
    const basicAuth = Buffer.from(`${this.configService.get<string>('TALLY_GATEWAY_USERNAME')}:${this.configService.get<string>('TALLY_GATEWAY_PASSWORD')}`, 'utf-8').toString('base64url') + '=';

    const body = {
      "amount": amount,
      "redirectUri": this.configService.get<string>('TALLY_GATEWAY_CALLBACK_URL'),
      "terminalId": this.configService.get<number>('TALLY_TERMINAL_ID'),
      "uniqueIdentifier": uuid
    };

    const headers = {
      Authorization: `Basic ${basicAuth}`,
      accept: "application/json",
      'Content-Type': 'application/json'
    };

    return await this.httpService.axiosRef
      .post(
        `${this.configService.get('TALLY_GATEWAY_BASE_URL')}/api/v1/Token`,
        body,
        {
          headers
        }
      )
      .then((res) => {
        return res.data.result;
      })
      .catch((err) => {
        throw new BadRequestException(err.response.data);
      });
  }

  async getGateway(amount: number, phoneNumber: string) {
    const uuid = uuidv4();
    // console.log(uuid);
    const token = await this.getToken(amount, uuid);

    const newTaaly = new this.taalyModel({
      amount,
      phoneNumber,
      token,
      uniqueIdentifier: uuid,
    });

    await newTaaly.save();

    // console.log(token);

    const response = await this.httpService.axiosRef
      .post(
        `${this.configService.get('TALLY_GATEWAY_BASE_URL')}/v1/payment`,
        {
          token
        }, {
        headers: {
          'Content-Type': "application/json"
        },
        maxRedirects: 0
      }
      )
      .catch((err) => {
        const res = err.response;
        if (String(res.status).startsWith('3')) {
          return res.headers?.location;
        }
        return new BadRequestException(res.data);
      });

    return response;
  }

  async updateTransaction(req: Request) {
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      const { uniqueIdentifier: uuid, grantId, status, switchResponseRrn } = req.body;
      const existedTaaly = await this.taalyModel.findOne({ uniqueIdentifier: uuid });
      if (!existedTaaly) return new BadRequestException();

      existedTaaly.status = status;
      existedTaaly.grantId = grantId;
      existedTaaly.resRn = switchResponseRrn;

      return await existedTaaly.save();
    } else {
      return new BadRequestException();
    }
  }

  async getLastTransaction(phoneNumber: string) {
    const lastTransaction = await this.taalyModel.findOne({ phoneNumber }).sort({ createdAt: -1 }).exec();
    return lastTransaction.uniqueIdentifier;
  }

  async transactionStatus(uuid: string) {
    const existingTran = await this.taalyModel.findOne({ uniqueIdentifier: uuid });
    if (!existingTran) return new BadRequestException('invalid transaction!');
    console.log(existingTran);

    const status = await this.httpService.axiosRef
      .post(
        `${this.configService.get('TALLY_GATEWAY_BASE_URL')}/api/v1/transaction/status`,
        {
          uniqueIdentifier: existingTran.uniqueIdentifier
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then((res) => {
        return res.data.result;
      })
      .catch((err) => {
        console.log(err.response);

        throw new BadRequestException(err.response.data);
      });

    return status;
  }

  async acknowledgeTransaction(uuid: string) {
    const existingTran = await this.taalyModel.findOne({ uniqueIdentifier: uuid });
    if (!existingTran) return new BadRequestException('invalid transaction!');
    const acknowledgement = await this.httpService.axiosRef
      .post(
        `${this.configService.get('TALLY_GATEWAY_BASE_URL')}/api/v1/payment/acknowledge`,
        {
          token: existingTran.token
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then((res) => {
        return res.data.result;
      })
      .catch((err) => {
        throw new BadRequestException(err.response.data);
      });

    if (acknowledgement.success)
      existingTran.rollback = acknowledgement.dateTime;

    return existingTran;
  }

  async rollbackTransaction(uuid: string) {
    const existingTran = await this.taalyModel.findOne({ uniqueIdentifier: uuid });
    if (!existingTran) return new BadRequestException('invalid transaction!');
    const acknowledgement = await this.httpService.axiosRef
      .post(
        `${this.configService.get('TALLY_GATEWAY_BASE_URL')}/api/v1/payment/rollback`,
        {
          token: existingTran.token
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then((res) => {
        return res.data.result;
      })
      .catch((err) => {
        throw new BadRequestException(err.response.data);
      });

    if (acknowledgement.acknowledged)
      existingTran.ackTime = acknowledgement.acknowledgeDateTime;

    return existingTran;
  }
}
