``` js if (!consume) {
                retryStrategy(async () => {
                    return await this.authRepository.incrementVerificationAttemps(emailExist.email).catch((err) => {
                        console.log("[increment] failed causes >>>", err)
                    });
                })
                throw new BadRequestException("Invalid or expired verification code");

            }
            await this.userService.activatingAccount(email);
            retryStrategy(async () => {
                return await this.authRepository.deleteVerification(email, 'email').catch((err) => {
                    console.log("[delete verification code] causes >>>", err)
                })
            })
``` 
-  retry strategy for db is unefficient because mongoose has internal retry mechanism
- for example the code above this it's not necessary 
