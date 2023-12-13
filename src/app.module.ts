import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Taaly, TaalySchema } from './schema/taaly.schema';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        user: configService.get<string>('DB_USERNAME'),
        pass: configService.get<string>('DB_PASSWORD'),
        dbName: configService.get<string>('DB_NAME')
      }),
      inject: [ConfigService]
    }),
    MongooseModule.forFeature([{ name: Taaly.name, schema: TaalySchema }])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }