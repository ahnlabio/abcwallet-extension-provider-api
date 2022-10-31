// "use strict";
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

declare function detectEthereumProvider<T = ABCProvider>({ silent, timeout }?: {
    silent?: boolean | undefined;
    timeout?: number | undefined;
    abc: string;
}): Promise<T | null>;

function ABCProvider({ silent = false, timeout = 3000 } = {}) {
    window.abc = window.abc || "";

    _validateInputs();
    let handled = false;
    return new Promise(resolve => {
        if (window.abc) {
            handleABC();
        } else {
            window.addEventListener("abc#initialized", handleABC, { once: true });
            setTimeout(() => {
                handleABC();
            }, timeout);
        }
        function handleABC() {
            if (handled) {
                return;
            }
            handled = true;
            window.removeEventListener("abc#initialized", handleABC);

            const { abc } = window;
            if (abc) {
                resolve(abc);
            } else {
                const message = abc ? "Non-ABC window.abc detected." : "Unable to detect window.abc.";
                !silent && console.error("detect-provider:", message);
                resolve(null);
            }
        }
    });
    function _validateInputs() {
        if (typeof silent !== "boolean") {
            throw new Error(`detect-provider: Expected option 'silent' to be a boolean.`);
        }
        if (typeof timeout !== "number") {
            throw new Error(`detect-provider: Expected option 'timeout' to be a number.`);
        }
    }
}
module.exports = ABCProvider;
