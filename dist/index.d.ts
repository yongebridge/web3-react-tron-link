import { BigNumber } from "@ethersproject/bignumber";
import type { Actions, Provider, RequestArguments, WatchAssetParameters } from "@web3-react/types";
import { Connector } from "@web3-react/types";
declare global {
    interface Window {
        tronLink?: TronLink;
        tronWeb?: TronProvider;
    }
}
export interface TronProvider extends Provider {
    isAddress(address: string): boolean;
    address: {
        fromHex(address: string): string;
        toHex(address: string): string;
        fromPrivateKey(pk: string): string;
    };
    defaultAddress: {
        hex: false | string;
        base58: false | string;
    };
    fromSun: (value: BigNumber) => Promise<BigNumber>;
    toHex(string: string): string;
    isTronLink: boolean;
    fullNode: {
        host: string;
    };
    request(args: RequestArguments): Promise<unknown>;
    trx: {
        sign: (hex: string) => Promise<void>;
        getBalance: (address: string) => Promise<BigNumber>;
        getCurrentBlock: () => Promise<{
            block_header: {
                raw_data: {
                    number: number;
                };
            };
        }>;
    };
    getBalance: (address: string) => Promise<BigNumber>;
    getBlockNumber: () => Promise<number>;
}
export interface TronLink {
    ready?: boolean;
    tronLinkParams?: {
        websiteName?: string;
        websiteIcon?: string;
    };
}
export type TronLinkOptions = {
    websiteName?: string;
    websiteIcon?: string;
};
export declare class NoTronProviderError extends Error {
    constructor();
}
export declare const tronChainId = 728126428;
export declare const shastaChainId = 2494104990;
export declare const nileChainId = 3448148188;
/**
 * @param options - Options to pass to the "provider" provider.
 * @param onError - Handler to report errors thrown from eventListeners.
 */
export interface TronConstructorArgs {
    actions: Actions;
    options?: TronLinkOptions;
    onError?: (error: Error) => void;
}
export declare class TronLink extends Connector {
    /** {@inheritdoc Connector.provider} */
    readonly provider: undefined;
    /** {@inheritdoc Connector.customProvider} */
    customProvider?: TronProvider;
    private tronLink?;
    private readonly options?;
    constructor({ actions, options, onError }: TronConstructorArgs);
    getChainId(): 728126428 | 2494104990 | 3448148188 | undefined;
    convertAddressTo0x(address: string): string;
    convertAddressTo41(address: string): string;
    /**
     * Setup the provider and listen to its events.
     */
    private isomorphicInitialize;
    /** {@inheritdoc Connector.connectEagerly} */
    connectEagerly(): Promise<void>;
    /**
     * Initiates a connection.
     */
    activate(): Promise<void>;
    watchAsset({ address, symbol, decimals, image, }: WatchAssetParameters): Promise<true>;
}
