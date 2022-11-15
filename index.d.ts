interface ABCEthereumProvider {
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
}
declare function ABCProvider<T = ABCEthereumProvider>({ silent, timeout, }?: {
    silent?: boolean | undefined;
    timeout?: number | undefined;
}): Promise<T | null>;
export = ABCProvider;
