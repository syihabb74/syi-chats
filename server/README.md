# SYI Chats — Server

This folder contains the NestJS server for the SYI Chats project.

This README covers quick setup, environment variables, running, and important implementation notes about JWT refresh tokens and MongoDB TTL indexes used for automatic refresh-token cleanup.

## Requirements

- Node.js (>= 18 recommended)
- npm or yarn
- MongoDB (local or remote)

## Quick setup

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file (or set environment variables in your environment). Minimal variables the app expects:

```
JOSE_SECRET_KEY=your_jose_secret_here
DATABASE_URI=mongodb://localhost:27017/your-db
```

3. Start in development mode

```bash
npm run start:dev
```

4. Build and run production

```bash
npm run build
npm run start:prod
```

## Important notes — refresh tokens and TTL

- The project stores refresh tokens in a Mongoose model named `Refresher` (see `src/common/entities/refresher.token.schema.ts`).
- The schema defines an `expires_at` (Date) field and a single-field TTL index on that field:

```ts
// single-field TTL index — MongoDB TTL monitor requires a single Date field index
refresherSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
```

- The application verifies refresh JWTs (using `jose`) and extracts the `exp` claim (expiration time in seconds). The service stores `expires_at` using that `exp` value (converted to a JS `Date`) so MongoDB will remove the document when the token expires.

- MongoDB runs the TTL monitor periodically (approximately every 60 seconds), so deletion may be slightly delayed after `expires_at`.

- Note about indexes in production: if your Mongoose connection is configured with `autoIndex: false` (common for production), Mongoose will not create indexes automatically at startup. To guarantee TTL index creation on production, either:

  - Create the index manually in the database, or
  - Call `Model.syncIndexes()` once at startup for the `Refresher` model, or
  - Enable index creation in deployment tooling.

## JWT configuration

- JWTs are created using `jose` (see `src/common/helpers/jwt.service.ts`). The service signs tokens with `JOSE_SECRET_KEY` and sets expiration using human-friendly strings (e.g., `"15m"`, `"7d"`).
- The refresh token's `exp` is used as the canonical expiration for the corresponding refresh document's `expires_at` to keep token expiry and DB TTL in sync.

## Useful scripts

- `npm run start:dev` — run in watch/dev mode
- `npm run build` — compile to `dist/`
- `npm run start:prod` — run production build

## Next steps / suggestions

- If you want stricter management of refresh tokens, implement an endpoint that marks a refresh token `is_used: true` when it's consumed and check that flag on reuse.
- Add `Model.syncIndexes()` to an initialization step if you need to ensure indexes are created automatically in production.
- Consider keeping secrets (like `JOSE_SECRET_KEY`) in a secrets manager for production deployments.

If you'd like, I can also add a short note to the repository root README linking to this server README — tell me where you'd like it.
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
