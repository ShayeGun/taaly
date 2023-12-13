import { Body, Controller, Delete, Get, Post, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller('taaly')
export class AppController {
  constructor(
    private readonly appService: AppService
  ) { }

  @Get('gateway')
  getGateway() {
    //FIX: fix this in EVC app
    return this.appService.getGateway(1000, '09120000001');
  }

  @Post()
  callback(@Req() req: Request) {
    return this.appService.updateTransaction(req);
  }

  @Get('transaction')
  lastTransaction(@Query('phoneNumber') phoneNumber: string) {
    return this.appService.getLastTransaction(phoneNumber);
  }

  @Get('transaction/status')
  transactionStatus(@Query('uniqueIdentifier') uuid: string) {
    return this.appService.transactionStatus(uuid);
  }

  @Post('transaction')
  acknowledgeTransaction(@Body('uuid') uuid: string) {
    return this.appService.acknowledgeTransaction(uuid);
  }

  @Delete('transaction')
  rollbackTransaction(@Query('uuid') uuid: string) {
    return this.appService.rollbackTransaction(uuid);
  }

  @Get('token')
  token() {
    const regex = new RegExp(/uniqueidentifier/, 'g');
    const rawToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vYXBzYW4uY28vd3MvMjAyMC8wOS9oZWNhdGUvY2xhaW1zL2dyYW50aWQiOiIxMzQ1ODk0NDU0NyIsImh0dHA6Ly9hcHNhbi5jby93cy8yMDIwLzA5L2hlY2F0ZS9jbGFpbXMvbWVyY2hhbnRpZCI6IjI0MTQiLCJodHRwOi8vYXBzYW4uY28vd3MvMjAyMC8wOS9oZWNhdGUvY2xhaW1zL3Rlcm1pbmFsaWQiOiIyMjk0IiwiaHR0cDovL2Fwc2FuLmNvL3dzLzIwMjAvMDkvaGVjYXRlL2NsYWltcy9hbW91bnQiOiIxMDAwIiwiaHR0cDovL2Fwc2FuLmNvL3dzLzIwMjAvMDkvaGVjYXRlL2NsYWltcy91bmlxdWVpZGVudGlmaWVyIjoiOWE4NTU3ZjctMDA0Zi00ODZmLWFiYzktZTU3NjE1OWJlM2ZmIiwiaHR0cDovL2Fwc2FuLmNvL3dzLzIwMjAvMDkvaGVjYXRlL2NsYWltcy9yZWRpcmVjdHVyaSI6Imh0dHBzOi8vdGFhbHkuY29yZS5ldmlwY2x1Yi5vcmcvIiwibmJmIjoxNzAyNDY0MzA0LCJleHAiOjE3MDI0NjU1MDQsImlhdCI6MTcwMjQ2NDMwNCwiaXNzIjoiaGVjYXRlLmFwc2FuLmNvIiwiYXVkIjoiaGVjYXRlLmFwc2FuLmNvIn0.QJTKXGfkddfj1ZvNQh8p6SaLL4ThRyhG4w3IKc0Fhzo".split('.')[1];

    const token = JSON.parse(Buffer.from(rawToken, 'base64').toString('utf-8'));

    for (let [k, v] of Object.entries(token)) {
      console.log(k, ' ====> ', v);
      if (typeof v === 'string' && regex.test(k)) {
        console.log("-------------------------------------");

        return v;
      }
    }


    return token;
  }
}
