**ABC Wallet Extension Provider API**
---

ABC Wallet injects a global API into website visited by its users at `window.abc`. This API complies [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193), Ethereum Javascript provider API. We recommend using `@abcwallet/abc-provider` to detect our provider on any platform or browser.

```javascript
import ABCProvider from '@abcwallet/abc-provider'; 
   
const currentProvider = await ABCProvider();
if (currentProvider) {
  if (currentProvider !== window.abc) {
    console.log('Please connect to ABC Wallet.');
  }
  await currentProvider.request({ method: 'eth_requestAccounts' });

  const web3 = new Web3(currentProvider);  
  const userAccount = await web3.eth.getAccounts();
  const chainId = await web3.eth.getChainId();
  const account = userAccount[0];

  let ethBalance = await web3.eth.getBalance(account); 
  ethBalance = web3.utils.fromWei(ethBalance, 'ether'); 

  saveUserInfo(ethBalance, account, chainId);
  if (userAccount.length === 0) {
    console.log('Please connect to ABC Wallet.');
  }
}
```

# Table of Contents
- [Table of Contents](#table-of-contents)
- [Compatibility](#compatibility)
- [Basic Usage](#basic-usage)
- [Chain IDs](#chain-ids)
- [Properties](#properties)
  - [abc.isABC](#abcisabc)
  - [abc.chainId](#abcchainid)
  - [abc.networkVersion](#abcnetworkversion)
  - [abc.selectedAddress](#abcselectedaddress)
- [Methods](#methods)
  - [abc.isConnected()](#abcisconnected)
  - [abc.request(args)](#abcrequestargs)
    - [Example](#example)
  - [Events](#events)
    - [connect](#connect)
    - [disconnect](#disconnect)
    - [accountsChanged](#accountschanged)
    - [chainChanged](#chainchanged)
    - [message](#message)
- [Errors](#errors)
- [Using the Provider](#using-the-provider)

# Compatibility
ABC Wallet support multi-chain functionality. At the moment of writing, [MetaMask](https://docs.metamask.io/guide/) is dominant crypto wallet for Ethereum and [Kaikas](https://docs.kaikas.io/) is for Kaikas. 

For Ethereum, [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193) clearly states `window.ethereum` is not part of the specification, however, to maximize the compatibility, ABC Wallet provider `window.abc` is also cloned to `window.ethereum`, and functions like MetaMask. 

For Klaytn, although we weren't able to find KIP equivalent or standards. However, [Kaikas API documentation](https://docs.kaikas.io/02_api_reference/01_klaytn_provider) specifies `window.klaytn` as default provider.

For maximum compatibility and user's convenience, we created same APIs compatible on both wallet providers.

Through out this document, you may consider `window.abc` is linked clone to to `window.ethereum` and `window.klaytn`.

# Basic Usage
For any non-trivial EVM based web application — a.k.a. dapp, web3 site etc. — to work, you will have to:

- Detect the provider (`window.abc` | `window.ethereum` | `window.klaytn`)
- Detect which network the user is connected to
- Get the user's account

The snippet at the top of this page is sufficient for detecting the provider. 

As a multi-chain supported wallet, ABC Wallet provides multiple ways on accessing provider functions for maximum compatibility, including [ethers](https://www.npmjs.com/package/ethers).

We recommend to use convenience library, however, in cases where you need to directly access provider, please check [Using the Provider](#using-the-provider) section.

# Chain IDs
These are the IDs of the Blockchain networks that ABC Wallet supports by default. Check website [ChainList](https://chainlist.org/) for more.

| Hex |	Decimal |	Network |
| ----: | --------: | :---------: |
| 0x1	| 1	| Ethereum Main Network (Mainnet) |
| 0x5 |	5 |	Goerli Test Network |
| 0x2019 | 8217 | Klaytn Main Network (Cypress) |
| 0x3e9 | 1001 | Klaytn Test Network (Baobab) |
| 0x38 | 56 | Binance Smart Chain Mainnet |
| 0x61 | 97 | Binance Smart Chain Testnet |
| 0x89 | 137 | Matic Main Network  |
| 0x13881 | 80001 | Matic Test Network (Mumbai) |

# Properties
## abc.isABC
Note that this property is non-standard.

`true` if the user has ABC Wallet installed.

## abc.chainId
Returns chain ID in hex.

```javascript
window.abc.chainId;
> "0x89"
```

## abc.networkVersion
These properties can be used to check the current state of the connected user, which can be important things to verify before sending a transaction. Returns decimal Chain ID in string type.

```javascript
abc.networkVersion;
> "137"
```

## abc.selectedAddress
Returns a hex-prefixed string representing the current user's selected address.

```javascript
abc.selectedAddress
> "0x0e9bc621207f12ff37589a2f234b7d1a920df135"
```

# Methods
## abc.isConnected()

```javascript
abc.isConnected();
> true
```
Returns `true` if the provider is connected to the current chain, and `false` otherwise.

In addition, ABC Wallet supports own provider `abc` which works exactly same as ethereum provider.

If the provider is not connected, the page will have to be reloaded in order for connection to be re-established. Please see the `connect` and `disconnect` events for more information.

## abc.request(args)
```javascript
interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

abc.request(args: RequestArguments): Promise<unknown>;
```

Use `request` to submit RPC requests to Ethereum via ABC Wallet. It returns a `Promise` that resolves to the result of the RPC method call.

The `params` and return value will vary by RPC method. In practice, if a method has any params, they are almost always of type `Array<any>`.

If the request fails for any reason, the Promise will reject with an [RPC Error](#errors).

ABC Wallet supports most standardized Ethereum RPC methods, in addition to a number of methods that may not be supported by other wallets. See the ABC Wallet RPC API documentation for details.

### Example
```
params: [
  {
    from: '0x0e9bc621207f12ff37589a2f234b7d1a920df135',
    to: '0xd40e8dd67c5d32be8058bb8eb970870f07244567',
    gas: '0x76c0', // 30400
    gasPrice: '0x9184e72a000', // 10000000000000
    value: '0x9184e72a', // 2441406250
    data:
      '0xd40e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
  },
];

abc
  .request({
    method: 'eth_sendTransaction',
    params,
  })
  .then((result) => {
    // The result varies by RPC method.
    // For example, this method will return a transaction hash hexadecimal string on success.
  })
  .catch((error) => {
    // If the request fails, the Promise will reject with an error.
  });
```
## Events
The ABC Wallet provider implements the [Node.js EventEmitter](https://nodejs.org/api/events.html) API. This sections details the events emitted via that API. There are innumerable `EventEmitter` guides elsewhere, but you can listen for events like this:

```js
abc.on('accountsChanged', (accounts) => {
  // Handle the new accounts, or lack thereof.
  // "accounts" will always be an array, but it can be empty.
});

abc.on('chainChanged', (chainId) => {
  // Handle the new chain.
  // Correctly handling chain changes can be complicated.
  // We recommend reloading the page unless you have good reason not to.
  window.location.reload();
});
```

Also, don't forget to remove listeners once you are done listening to them (for example on component unmount in React):

```js
function handleAccountsChanged(accounts) {
  // ...
}

abc.on('accountsChanged', handleAccountsChanged);

// Later

abc.removeListener('accountsChanged', handleAccountsChanged);
```

The first argument of the `abc.removeListener` is the event name and the second argument is the reference to the same function which has passed to `abc.on` for the event name mentioned in the first argument.

### connect
```js
interface ConnectInfo {
  chainId: string;
}

abc.on('connect', handler: (connectInfo: ConnectInfo) => void);
```

The ABC Wallet provider emits this event when it first becomes able to submit RPC requests to a chain. We recommend using a connect event handler and the [`abc.isConnected()` method](#abcisconnected) in order to determine when/if the provider is connected.

### disconnect
```js
abc.on('disconnect', handler: (error: ProviderRpcError) => void);
```
The ABC Wallet provider emits this event if it becomes unable to submit RPC requests to any chain. In general, this will only happen due to network connectivity issues or some unforeseen error.

Once `disconnect` has been emitted, the provider will not accept any new requests until the connection to the chain has been re-established, which requires reloading the page. You can also use the [`ethereum.isConnected()` method](#abcisconnected) to determine if the provider is disconnected.

### accountsChanged
```js
abc.on('accountsChanged', handler: (accounts: Array<string>) => void);
```

The ABC Wallet provider emits this event whenever the return value of the `eth_accounts` RPC method changes. eth_accounts returns an array that is either empty or contains a single account address. The returned address, if any, is the address of the most recently used account that the caller is permitted to access. Callers are identified by their URL origin, which means that all sites with the same origin share the same permissions.

This means that `accountsChanged` will be emitted whenever the user's exposed account address changes.


### chainChanged
```js
abc.on('chainChanged', handler: (chainId: string) => void);
```

The ABC Wallet provider emits this event when the currently connected chain changes.

All RPC requests are submitted to the currently connected chain. Therefore, it's critical to keep track of the current chain ID by listening for this event.

We strongly recommend reloading the page on chain changes, unless you have good reason not to.

```javascript
abc.on('chainChanged', (_chainId) => window.location.reload());
```

### message
```javascript
interface ProviderMessage {
  type: string;
  data: unknown;
}
abc.on('message', handler: (message: ProviderMessage) => void);
```
The ABC Wallet provider emits this event when it receives some message that the consumer should be notified of. The kind of message is identified by the `type` string.

RPC subscription updates are a common use case for the `message` event. For example, if you create a subscription using `eth_subscribe`, each subscription update will be emitted as a message event with a `type` of `eth_subscription`.
# Errors
All errors thrown or returned by the ABC Wallet provider follow this interface:

```javascript
interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}
```
The [`abc.request(args)` method](#abcrequestargs) throws errors eagerly. You can often use the error `code` property to determine why the request failed. Common codes and their meaning include:

- 4001: The request was rejected by the user
- 32602: The parameters were invalid
- 32603: Internal error

For the complete list of errors, please see [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193#provider-errors) and [EIP-1474](https://eips.ethereum.org/EIPS/eip-1474#error-codes).

The [`eth-rpc-errors`](https://npmjs.com/package/eth-rpc-errors) package implements all RPC errors thrown by the ABC Wallet provider, and can help you identify their meaning.

# Using the Provider
This snippet explains how to accomplish the three most common requirements for web3 sites:

- Detect the ABC provider (window.abc)
- Detect which Network the user is connected to
- Get the user's account(s)

```js
/*****************************************/
/* Detect the ABC Wallet Ethereum provider */
/*****************************************/

import detectEthereumProvider from '@abcwallet/abc-provider';

// this returns the provider, or null if it wasn't detected
const provider = await detectEthereumProvider();

if (provider) {
  startApp(provider); // Initialize your app
} else {
  console.log('Please install ABC Wallet!');
}

function startApp(provider) {
  // If the provider returned by detectEthereumProvider is not the same as
  // window.ethereum, something is overwriting it, perhaps another wallet.
  if (provider !== window.ethereum) {
    console.error('Do you have multiple wallets installed?');
  }
  // Access the decentralized web!
}

/**********************************************************/
/* Handle chain (network) and chainChanged (per EIP-1193) */
/**********************************************************/

const chainId = await abc.request({ method: 'eth_chainId' });
handleChainChanged(chainId);

abc.on('chainChanged', handleChainChanged);

function handleChainChanged(_chainId) {
  // We recommend reloading the page, unless you must do otherwise
  window.location.reload();
}

/***********************************************************/
/* Handle user accounts and accountsChanged (per EIP-1193) */
/***********************************************************/

let currentAccount = null;
abc
  .request({ method: 'eth_accounts' })
  .then(handleAccountsChanged)
  .catch((err) => {
    // Some unexpected error.
    // For backwards compatibility reasons, if no accounts are available,
    // eth_accounts will return an empty array.
    console.error(err);
  });

// Note that this event is emitted on page load.
// If the array of accounts is non-empty, you're already
// connected.
abc.on('accountsChanged', handleAccountsChanged);

// For now, 'eth_accounts' will continue to always return an array
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // ABC Wallet is locked or the user has not connected any accounts
    console.log('Please connect to ABC Wallet.');
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    // Do any other work!
  }
}

/*********************************************/
/* Access the user's accounts (per EIP-1102) */
/*********************************************/

// You should only attempt to request the user's accounts in response to user
// interaction, such as a button click.
// Otherwise, you popup-spam the user like it's 1999.
// If you fail to retrieve the user's account(s), you should encourage the user
// to initiate the attempt.
document.getElementById('connectButton', connect);

// While you are awaiting the call to eth_requestAccounts, you should disable
// any buttons the user can click to initiate the request.
// ABC Wallet will reject any additional requests while the first is still
// pending.
function connect() {
  abc.request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to ABC Wallet.');
      } else {
        console.error(err);
      }
    });
}
```

