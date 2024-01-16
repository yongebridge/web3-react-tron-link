"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TronLink = exports.nileChainId = exports.shastaChainId = exports.tronChainId = exports.NoTronProviderError = void 0;
const types_1 = require("@web3-react/types");
function parseChainId(chainIdHex) {
    return typeof chainIdHex === "number"
        ? chainIdHex
        : Number.parseInt(chainIdHex, chainIdHex.startsWith("0x") ? 16 : 10);
}
class NoTronProviderError extends Error {
    constructor() {
        super("Tron Link not installed");
        this.name = NoTronProviderError.name;
        Object.setPrototypeOf(this, NoTronProviderError.prototype);
    }
}
exports.NoTronProviderError = NoTronProviderError;
exports.tronChainId = 728126428; // 0x2b6653dc
exports.shastaChainId = 2494104990; // 0x94a9059e
exports.nileChainId = 3448148188; // 0xcd8690dc
class TronLink extends types_1.Connector {
    constructor({ actions, options, onError }) {
        super(actions, onError);
        this.options = options;
    }
    getChainId() {
        if (!this.customProvider)
            return undefined;
        if (this.customProvider.fullNode.host.includes("api.trongrid")) {
            return exports.tronChainId;
        }
        else if (this.customProvider.fullNode.host.includes("api.tronstack")) {
            return exports.tronChainId;
        }
        else if (this.customProvider.fullNode.host.includes("api.shasta")) {
            return exports.shastaChainId;
        }
        else if (this.customProvider.fullNode.host.includes("api.nile")) {
            return exports.nileChainId;
        }
    }
    convertAddressTo0x(address) {
        if (address.startsWith("0x")) {
            return address;
        }
        else if (address.startsWith("41")) {
            return "0x" + address.substring(2);
        }
        else if (this.customProvider) {
            // Base58 to 0x
            return "0x" + this.customProvider.address.toHex(address).substring(2);
        }
        return address;
    }
    convertAddressTo41(address) {
        if (address.startsWith("41")) {
            return address;
        }
        else if (address.startsWith("0x")) {
            return "41" + address.substring(2);
        }
        else if (this.customProvider) {
            // Base58 to 41
            return this.customProvider.address.toHex(address);
        }
        return address;
    }
    /**
     * Setup the provider and listen to its events.
     */
    isomorphicInitialize() {
        var _a, _b;
        if (this.customProvider)
            return;
        // Check if tron link is installed
        const tronLink = window === null || window === void 0 ? void 0 : window.tronLink;
        if (!tronLink)
            return;
        // Set options
        this.tronLink = tronLink;
        this.tronLink.tronLinkParams = {
            websiteName: (_a = this.options) === null || _a === void 0 ? void 0 : _a.websiteName,
            websiteIcon: (_b = this.options) === null || _b === void 0 ? void 0 : _b.websiteIcon,
        };
        if (!tronLink.ready)
            return;
        const provider = window.tronWeb;
        if (!provider)
            return;
        this.customProvider = provider;
        const callbacks = (event) => {
            var _a, _b, _c, _d, _e;
            if (!((_a = event.data) === null || _a === void 0 ? void 0 : _a.isTronLink) || !((_b = event.data) === null || _b === void 0 ? void 0 : _b.message))
                return;
            const { data, action } = event.data.message || {};
            if (action === "tunnel")
                return;
            // Called on login, logout, connect, disconnect, change account, change chainId
            if (action === "tabReply") {
                const address = data === null || data === void 0 ? void 0 : data.address; // Base58
                const chainId = (_d = (_c = data === null || data === void 0 ? void 0 : data.data) === null || _c === void 0 ? void 0 : _c.node) === null || _d === void 0 ? void 0 : _d.chainId;
                if (!chainId || !address)
                    return;
                this.actions.update({
                    chainId: parseChainId(chainId),
                    accounts: [this.convertAddressTo0x(address)],
                });
            }
            // Called on login, logout, change account, change chainId
            if (action === "setAccount") {
                if (data === null || data === void 0 ? void 0 : data.address) {
                    this.actions.update({
                        accounts: [this.convertAddressTo0x(data.address)],
                    });
                }
                else {
                    this.actions.resetState();
                }
            }
            // Called on login, change chainId
            if (action === "setNode") {
                if (!((_e = data === null || data === void 0 ? void 0 : data.node) === null || _e === void 0 ? void 0 : _e.chainId))
                    return;
                this.actions.update({ chainId: parseChainId(data.node.chainId) });
            }
        };
        window.addEventListener("message", callbacks);
    }
    /** {@inheritdoc Connector.connectEagerly} */
    connectEagerly() {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            const cancelActivation = this.actions.startActivation();
            this.isomorphicInitialize();
            if (!this.customProvider)
                cancelActivation();
            try {
                const { code } = (yield ((_a = this.customProvider) === null || _a === void 0 ? void 0 : _a.request({
                    method: "tron_requestAccounts",
                })));
                if (code === 4001)
                    throw new Error("No accounts found");
                // Grab the address
                const address = ((_c = (_b = this.customProvider) === null || _b === void 0 ? void 0 : _b.defaultAddress) === null || _c === void 0 ? void 0 : _c.hex)
                    ? this.convertAddressTo0x((_e = (_d = this.customProvider) === null || _d === void 0 ? void 0 : _d.defaultAddress) === null || _e === void 0 ? void 0 : _e.hex)
                    : undefined;
                if (!address)
                    throw new Error("No accounts found");
                return this.actions.update({
                    chainId: this.getChainId(),
                    accounts: [address],
                });
            }
            catch (error) {
                console.debug("connectEagerly Could not connect eagerly", error);
                return cancelActivation === null || cancelActivation === void 0 ? void 0 : cancelActivation();
            }
        });
    }
    /**
     * Initiates a connection.
     */
    activate() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const cancelActivation = ((_a = this.tronLink) === null || _a === void 0 ? void 0 : _a.ready)
                ? null
                : this.actions.startActivation();
            this.isomorphicInitialize();
            if (!this.tronLink)
                throw new NoTronProviderError();
            if (!this.customProvider) {
                cancelActivation === null || cancelActivation === void 0 ? void 0 : cancelActivation();
                throw new Error("Unlock Wallet");
            }
            const requestAccounts = this.customProvider.request({
                method: "tron_requestAccounts",
            });
            return yield requestAccounts
                .then(({ code }) => {
                var _a, _b, _c, _d;
                if (code === 4001)
                    throw new Error("No accounts returned");
                const address = ((_b = (_a = this.customProvider) === null || _a === void 0 ? void 0 : _a.defaultAddress) === null || _b === void 0 ? void 0 : _b.hex)
                    ? this.convertAddressTo0x((_d = (_c = this.customProvider) === null || _c === void 0 ? void 0 : _c.defaultAddress) === null || _d === void 0 ? void 0 : _d.hex)
                    : undefined;
                if (!address)
                    throw new Error("No accounts returned");
                this.actions.update({
                    chainId: this.getChainId(),
                    accounts: [address],
                });
            })
                .catch((error) => {
                console.debug("activate Could not connect eagerly", error);
                cancelActivation === null || cancelActivation === void 0 ? void 0 : cancelActivation();
            });
        });
    }
    watchAsset({ address, symbol, decimals, image, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.customProvider)
                throw new Error("No provider");
            return this.customProvider
                .request({
                method: "wallet_watchAsset",
                params: {
                    type: "trc20",
                    options: {
                        address,
                        symbol,
                        decimals,
                        image, // A string url of the token logo
                    },
                },
            })
                .catch(() => {
                return true;
            })
                .then((res) => {
                return true;
            });
        });
    }
}
exports.TronLink = TronLink;
