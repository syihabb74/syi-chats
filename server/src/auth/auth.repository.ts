import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Refresher } from "src/common/entities/refresher.token.schema";
import IRefresher from "src/common/interfaces/refresher.interfaces";



@Injectable()
export class AuthRepository {

    constructor(
        @InjectModel(Refresher.name) private refresherModel : Model<Refresher>) {

    }

    async saveRefreshToken(refresh_token : IRefresher) {

        const createRefresher = new this.refresherModel(refresh_token)
        return createRefresher.save();

    }


}