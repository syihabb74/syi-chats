interface retryOptions {
    maxRetries? : number
    baseDelay? : number
    maxDelay? : number
}

export default async function retryStrategy<T> (fn : () => Promise<T>, options : retryOptions = {}, attempt = 0): Promise<T> {
    const {
        maxRetries = 5,
        baseDelay = 100,
        maxDelay = 10000,
    } = options
    try {
        return await fn()
    } catch (error) {
        if (attempt >= maxRetries) {
            throw error
        }
        const exponentialDelay = Math.pow(2, attempt) * baseDelay;
        const jitter = Math.floor(Math.random() * baseDelay);
        const delay = Math.min(exponentialDelay + jitter, maxDelay)
        await new Promise(r => setTimeout(r, delay))
        return retryStrategy(fn, options,attempt + 1)
    }

}