interface ABCProvider {
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
}
interface Window {
    abc: string;
}

export = ABCProvider;

declare function detectEthereumProvider<T = ABCProvider>({ silent, timeout }?: {
    silent?: boolean | undefined;
    timeout?: number | undefined;
    abc: string;
}): Promise<T | null>;
