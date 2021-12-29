import streetLogo from "./img/street-logo.svg";
import kolkhozLogo from "./img/kolkhoz-logo.jpeg";
import usdnLogo from "./img/usdn-logo.svg";
import mathLogo from "./img/math-logo.png";
import eggseggsLogo from "./img/eggseggs-logo.jpeg";
import fomoLogo from "./img/fomo-logo.jpeg";
import latinaLogo from "./img/latina-logo.png";
import turtleLogo from "./img/turtle-logo.png";
import eggPointLogo from "./img/eggpoint-logo.jpeg";
import duxplorerLogo from "./img/duxplorer-logo.png";
import mundoLogo from "./img/mundo-logo.jpeg";
import eggLogo from "./img/logos/EGG.svg";
import eggmoonLogo from "./img/ido-logo.jpeg";
import endoLogo from "./img/endo-logo.jpeg";
import marvinLogo from "./img/marvin-logo.jpeg";
import cartelLogo from "./img/cartel-logo.png";
import cguLogo from "./img/cgu-logo.png";

import raceLogo from "./img/race-logo.svg";
import wxLogo from "./img/logos/WX.svg";
import puzzleLogo from "./img/logos/PUZZLE.svg";
import ennoLogo from "./img/logos/enno-logo.svg";
import nsbtLogo from "./img/logos/nsbt-logo.svg";
import signLogo from "./img/logos/sign-logo.svg";
import viresLogo from "./img/logos/VIRES.svg";
import swopLogo from "./img/logos/SWOP.svg";
import wavesLogo from "./img/logos/waves.png";
import usdtLogo from "./img/logos/USDT.svg";
import usdtlamboLogo from "./img/logos/USDTLAMBO.svg";

import {API_URL, IContractStateKey} from "./MultiSwapInterface";
import axios from "axios";
import {calculateTokenPrice} from "./WalletModule";

export enum PoolNames {
    street = 'street',
    pool1 = 'pool-1',
    megapool = 'farms',
    megapool2 = 'farms2',
    defi = 'defi',
    puzzle = 'puzzle',
    race = 'race'
}

export const poolsData: any = {
    // [PoolNames.street]: {
    //     tokenIds: [
    //         "CE5cxMvz7865CyFZPFUmDiL4KRkYXP6b6oYgN3vmWdV5",
    //         "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p"
    //     ],
    //     tokenNames: [
    //         "STREET",
    //         "USDN"
    //     ],
    //     tokenShares: [
    //         0.8,
    //         0.2
    //     ],
    //     tokenDecimals: [
    //         10**8,
    //         10**6
    //     ],
    //     contractAddress: "3PBns59bMvZXnWnsxgtL3oPCujBtTB2PPBc"
    // },

    // [PoolNames.pool1]: {
    //     tokenIds: [
    //         "CE5cxMvz7865CyFZPFUmDiL4KRkYXP6b6oYgN3vmWdV5",
    //         "5m5stLsMZSPomwxTTjJGMMEnjMafRMfap5vZyaLwgMKD",
    //         "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p"
    //     ],
    //     tokenNames: [
    //         "STREET",
    //         "KOLZHOZ",
    //         "USDN"
    //     ],
    //     tokenLogos: [
    //         streetLogo,
    //         kolkhozLogo,
    //         usdnLogo
    //     ],
    //     tokenShares: [
    //         0.3,
    //         0.3,
    //         0.4
    //     ],
    //     tokenDecimals: [
    //         10**8,
    //         10**8,
    //         10**6
    //     ],
    //     contractAddress: "3P2JZoSPuSfYWxLyvCuS9ETeGACvvsws4bT"
    // },

    [PoolNames.megapool]: {
        tokenIds: [
            'EfdcPXw7o7rrrPWmMBr2sa66Dk95n56622ngujbaGhye',
            'B543bkZcZNo5GrUnd5fxB6EwkiJhAVyKCkPn5nWzZC2s',
            '5bcAh1r6ydrpk44FEmrnmJQjumgKo3NKEEsyfgmZYwxC',
            '54UszKAj3MtYmkdRCqSXAcaQLaVALBy7CCrVkfmfzhxR',
            '5nk9JW8yRonyNBEwhChoksLxpBECVxbVLqaNuQs9EJn1',
            'Dfx6LJPndo1h5Umk9SofDhMDs6Gi8cHyT3873pSgoASU',
            '4kwKSf4Bx2Wq8YxKnVZBhcEHyXzEtJ2pw7ixfJgirwf2',
            'Ej7kEzxvUsoiMtJKiuFpMD9tC6qfCADpZynyW2vqcWW',
            'C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS',
            'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p'
        ],
        tokenNames: [
            "DUXPLORER",
            "MATH",
            "TURTLE",
            "EGGSEGGS",
            "PESOLATINO",
            "FOMO",
            "MUNDO",
            "EGGPOINT",
            "EGG",
            "USDN"
        ],
        tokenLogos: [
            duxplorerLogo,
            mathLogo,
            turtleLogo,
            eggseggsLogo,
            latinaLogo,
            fomoLogo,
            mundoLogo,
            eggPointLogo,
            eggLogo,
            usdnLogo
        ],
        tokenShares: [
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1,
            0.1
        ],
        tokenDecimals: [
            10**8,
            10**8,
            10**8,
            10**8,
            10**8,
            10**8,
            10**8,
            10**8,
            10**8,
            10**6
        ],
        contractAddress: "3PPRHHF9JKvDLkAc3aHD3Kd5tRZp1CoqAJa",
        layer2Address: "3PDVDYZiwJzK3pu8vcknuLiKCYBPx6XZntG",
        baseTokenId: "C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS",
        name: "Farms 1"
    },

    [PoolNames.megapool2]: {
        tokenIds: [
            '5HGPPLj58XUx3ryMgkASJoqYq33zwBbTMf1CGxfKw6jp',
            'yDf4UTg4DS75sCNP7oC1HraTN4KHtqmd6WueTid4PF1',
            '2R57nL7ftpuwbgdprcmAeA9i7ykLH6A4wzLkZHWPiHKc',
            'CE5cxMvz7865CyFZPFUmDiL4KRkYXP6b6oYgN3vmWdV5',
            '5m5stLsMZSPomwxTTjJGMMEnjMafRMfap5vZyaLwgMKD',
            '46PdJcKzDuYfzLuLNjffM3F8jR8hL357V9AdGK2xN3kx',
            'ESaD2AREvgk7o4C9eQkZ8Nmau9BSHqgTK5ymHV36xocy',
            'C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS',
            'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p'
        ],
        tokenNames: [
            "ENDO",
            "MARVIN",
            "EGGMOON",
            "STREET",
            "KOLKHOZ",
            "FORKLOG",
            "CGU",
            "EGG",
            "USDN"
        ],
        tokenLogos: [
            endoLogo,
            marvinLogo,
            eggmoonLogo,
            streetLogo,
            kolkhozLogo,
            cartelLogo,
            cguLogo,
            eggLogo,
            usdnLogo
        ],
        tokenShares: [0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.20, 0.10],
        tokenDecimals: [10**8, 10**8, 10**8, 10**8, 10**8, 10**8, 10**8, 10**8, 10**6],
        contractAddress: "3PKYPKJPHZENAAwH9e7TF5edDgukNxxBt3M",
        layer2Address: "3PLNxoMJYKzcA8qQ7hQidGDaUJNvM4w36nj",
        baseTokenId: "C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS",
        name: "Farms 2"
    },

    [PoolNames.defi]: {
        tokenIds: [
            'WAVES',
            'C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS',
            'Ehie5xYpeN8op1Cctc6aGUrqx8jq3jtf1DSjXDbfm7aT',
            'DSbbhLsSTeDg5Lsiufk2Aneh3DjVqJuPr2M9uU1gwy5p',
            '6nSpVyNH7yM69eg446wrQR94ipbbcmZMU1ENPwanC97g',
            '7LMV3s1J4dKpMQZqge5sKYoFkZRLojnnU49aerqos4yg',
            '9sQutD5HnRvjM1uui5cVC4w9xkMPAfYEV8ymug3Mon2Y',
            'HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS',
            '34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ',
            'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p'
        ],
        tokenNames: [
            'WAVES',
            'EGG',
            'SWOP',
            'VIRES',
            'NSBT',
            'ENNO',
            'SIGN',
            'PUZZLE',
            'USDT',
            'USDN'
        ],
        tokenLogos: [
            wavesLogo,
            eggLogo,
            swopLogo,
            viresLogo,
            nsbtLogo,
            ennoLogo,
            signLogo,
            puzzleLogo,
            usdtLogo,
            usdnLogo
        ],
        tokenShares: [0.2, 0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0.2, 0.1, 0.15],
        tokenDecimals: [10**8, 10**8, 10**8, 10**8, 10**6, 10**8, 10**8, 10**8, 10**6, 10**6],
        contractAddress: "3PDrYPF6izza2sXWffzTPF7e2Fcir2CMpki",
        layer2Address: "3PJAg4A4gPQXtSLKQNAf5VxbXV2QVM9wPei",
        baseTokenId: "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
        name: "Waves DeFi"
    },

    [PoolNames.puzzle]: {
        tokenIds: [
            '34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ',  // USDT
            'HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS',  // PUZZLE
            'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p'   // USDN
        ],
        tokenNames: [
            "USDT",
            "PUZZLE",
            "USDN"
        ],
        tokenLogos: [
            usdtLogo,
            puzzleLogo,
            usdnLogo
        ],
        tokenShares: [0.1, 0.8, 0.1],
        tokenDecimals: [10**6, 10**8, 10**6],
        contractAddress: "3PFDgzu1UtswAkCMxqqQjbTeHaX4cMab8Kh",
        baseTokenId: "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
        name: "Puzzle Parent Pool"
    },

    [PoolNames.race]: {
        tokenIds: [
            'C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS',  // EGG
            'D4TPjtzpsDEJFS1pUAkvh1tJJJMNWGcSrds9sveBoQka',  // RACE
            'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p'   // USDN
        ],
        tokenNames: [
            "EGG",
            "RACE",
            "USDN"
        ],
        tokenLogos: [
            eggLogo,
            raceLogo,
            usdnLogo
        ],
        tokenShares: [0.4, 0.4, 0.2],
        tokenDecimals: [10**8, 10**8, 10**6],
        contractAddress: "3PNK5ypnPJioLmLUzfK6ezpaePHLxZd6QLj",
        layer2Address: "3PQSAdwsdyPVVpfBwjtgXboVXUZgeYHycWM",
        baseTokenId: "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p",
        name: "MetaRace mega pool"
    }
}

export const appTokens: any = {}
for (const pool of Object.keys(poolsData)) {
    for (const n in poolsData[pool].tokenIds) {
        appTokens[poolsData[pool]["tokenIds"][n]] = {
            name: poolsData[pool]["tokenNames"][n],
            logo: poolsData[pool]["tokenLogos"][n],
            share: poolsData[pool]["tokenShares"][n],
            decimals: poolsData[pool]["tokenDecimals"][n],
            pool: pool,
            contractAddress: poolsData[pool]["contractAddress"],
            tokenId: poolsData[pool]["tokenIds"][n]
        }
    }
}

async function downloadState(contractAddress: string){
    const data: Array<IContractStateKey> = (await axios.get(`${API_URL}/addresses/data/${contractAddress}`)).data;
    const dataMap = new Map();
    data.forEach((kv) => {
        dataMap.set(kv.key, kv.value);
    });
    return dataMap
}

export async function downloadStates() {
    const states: any = {}
    for (const pool of Object.keys(poolsData)) {
        states[poolsData[pool]["contractAddress"]] = await downloadState(poolsData[pool]["contractAddress"])
    }
    return states
}