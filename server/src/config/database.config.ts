import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({
    uri : process.env.MONGODB_URI,
    collection : 'Syi-Chats'
}))