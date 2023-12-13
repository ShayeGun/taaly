import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum, IsInt, IsJWT, IsPhoneNumber, IsPositive, IsString, IsUUID, Min } from 'class-validator';
import { HydratedDocument } from 'mongoose';

enum TaalyStatus {
    SUCCESS = 'Success',
    FAILED = 'Failed',
    TIMEOUT = 'Timeout',
    CANCEL = 'Cancel',
    PENDING = 'Pending'
}

export type TaalyDocument = HydratedDocument<Taaly>;

@Schema({
    timestamps: true,
    versionKey: false
})
export class Taaly {
    @IsPhoneNumber()
    @IsString()
    @Prop({ required: true })
    phoneNumber: string;

    @IsJWT()
    @IsString()
    @Prop({ required: true })
    token: string;

    @Min(0)
    @IsInt()
    @Prop({ select: true })
    amount: number;

    @IsUUID()
    @IsString()
    @Prop({ required: true })
    uniqueIdentifier: string;

    @IsEnum(TaalyStatus)
    @Prop({ required: true, default: TaalyStatus.PENDING })
    status: TaalyStatus;

    @Prop({ required: false })
    grantId?: number;

    @Prop({ required: false })
    resRn?: string;

    @Prop({ required: false })
    ackTime?: string;

    @Prop({ required: false })
    rollback?: string;
}

export const TaalySchema = SchemaFactory.createForClass(Taaly);
