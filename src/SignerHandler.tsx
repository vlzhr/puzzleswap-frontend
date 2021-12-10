import { Signer } from '@waves/signer';
import { ProviderWeb } from '@waves.exchange/provider-web';
import { ProviderCloud } from "@waves.exchange/provider-cloud";
import { ProviderKeeper } from '@waves/provider-keeper';
import {appTokens, downloadStates} from "./Pools";
import {calculateTokenPrice} from "./WalletModule";
import {API_URL, IContractStateKey} from "./MultiSwapInterface";
import axios from "axios";



export class SignerWebHandler {
    public signer: any;

    constructor() {
        this.signer = new Signer({
            NODE_URL: 'https://nodes.wavesnodes.com'
        });
        this.signer.setProvider(new ProviderWeb('https://waves.exchange/signer/'));
    }
}

export class SignerEmailHandler {
    public signer: any;

    constructor() {
        this.signer = new Signer();
        this.signer.setProvider(new ProviderCloud());
    }
}

export class SignerKeeperHandler {
    public signer: any;

    constructor() {
        this.signer = new Signer();
        const authData = {
            data: 'you know what is the main reason',
        }
        this.signer.setProvider(new ProviderKeeper(authData));
    }
}


export const signerWeb = new SignerWebHandler();
export const signerEmail = new SignerEmailHandler();
export const signerKeeper = new SignerKeeperHandler();


export class GlobalSigner {
    public signer: any;
    public authorizationMethod: string;

    constructor() {
        this.authorizationMethod = localStorage.getItem("authMethod") as String as "";
        this.auth(this.authorizationMethod);
    }

    async updateBalances() {
        const states = await downloadStates()

        const data: Array<any> = (await axios.get(`${API_URL}/assets/balance/${localStorage.getItem("userAddress")}`)).data.balances;
        const wavesBalance = (await axios.get(`${API_URL}/addresses/balance/details/${localStorage.getItem("userAddress")}`)).data.regular;

        let balances: any = []
        for (const asset of data) {
            if (appTokens.hasOwnProperty(asset.assetId)) {
                const assetInfo = appTokens[asset.assetId]
                assetInfo["balance"] = Number(asset["balance"]) / assetInfo["decimals"]
                assetInfo["value"] = calculateTokenPrice(assetInfo, states) * assetInfo["balance"]
                balances.push(assetInfo)
            }
        }

        const assetInfo = appTokens["WAVES"]
        assetInfo["balance"] = Number(wavesBalance) / assetInfo["decimals"]
        assetInfo["value"] = calculateTokenPrice(assetInfo, states) * assetInfo["balance"]
        balances.push(assetInfo)

        balances = balances.sort((x: any, y: any) => (y.value - x.value))
        console.log(balances)

        localStorage.setItem("userBalances", JSON.stringify(balances))
    }

    auth(authorizationMethod: string) {
        this.authorizationMethod = authorizationMethod;
        if (authorizationMethod == "email") {
            this.signer = signerEmail.signer;
        } else if (authorizationMethod == "seed") {
            this.signer = signerWeb.signer;
        } else {
            this.signer = signerKeeper.signer;
        }

        localStorage.setItem("authMethod", authorizationMethod)
        console.log("initialized with ", authorizationMethod)
    }

    logout() {
        localStorage.removeItem("authMethod")
        localStorage.removeItem("userAddress")
        localStorage.removeItem("userBalances")

        window.location.reload()
    }
}

export let globalSigner = new GlobalSigner();


