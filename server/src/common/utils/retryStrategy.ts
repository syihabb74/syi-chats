

export default async function retryStrategy<T> (fn : () => Promise<T>, times = 1): Promise<T> {
    try {
        return await fn()
    } catch (error) {
        if (times > 5) {
            throw error
        }
        const baseDelay = Math.pow(2, times) * 100 // base exponential
        const jitter = Math.floor(Math.random() * 100)
        const delay = baseDelay + jitter
        await new Promise(r => setTimeout(r, delay))
        return retryStrategy(fn, times + 1)
    }

}