import { Injectable } from "@nestjs/common";
import { compareSync, hashSync } from "bcryptjs";


@Injectable()
export class BcryptService {

    hashPassword (plainPassword : string) {

        return hashSync(plainPassword, 10)

    }

    comparePassword (userInputPassword : string, hashedPassword : string) {

        return compareSync(userInputPassword, hashedPassword);

    }

}