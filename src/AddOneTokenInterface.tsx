import React from "react";
import axios from 'axios';
import {appTokens, PoolNames, poolsData} from "./Pools";
import { Link } from "react-router-dom";
import {API_URL, IContractStateKey} from "./MultiSwapInterface";
import comingSoon from "./img/comingSoon.svg";
import {globalSigner} from "./SignerHandler";
import attentionImg from "./img/attention.svg";
import {Button, Modal, ModalBody, ModalHeader} from "reactstrap";
import {auth} from "@waves/waves-transactions";
import {errorMessage, successMessage} from "./AuthInterface";
import {valueOrZero} from "./InvestToPoolInterface";

interface IState{
    percentage: Number;
    balances: any;
    poolState: any;
    minPIssued: Number;
    maxValue: Number;
    allTokensHave: Boolean;
    userAddress: String;
    auth: Boolean;
    eggAmount: Number;
}

interface IProps{
    poolName: string;
}


export function strToNum(n: string) {
    console.log(n, Number(n))
    return Number(n)
}

const mouseClickEvents = ['mousedown', 'click', 'mouseup'];
function simulateMouseClick(element: Element){
    mouseClickEvents.forEach(mouseEventType =>
        element.dispatchEvent(
            new MouseEvent(mouseEventType, {
                view: window,
                bubbles: true,
                cancelable: true,
                buttons: 1
            })
        )
    );
}

export class AddOneTokenInterface extends React.Component<IProps, IState> {

    poolData: any = {};
    dicBalances: any = {};
    poolName: string = "";

    constructor(props: any) {
        super(props);

        let balances: [], auth: boolean = true;
        let balancesStr = localStorage.getItem('userBalances');
        if (!balancesStr) {balances = []; auth= false;} else {balances = JSON.parse(balancesStr)}
        for (const b of balances) {
            this.dicBalances[b["name"]] = b;
        }

        const defaultState = new Map();
        const poolName = props.poolName as PoolNames;
        this.poolData = poolsData[poolName];
        this.state = {
            percentage: 50,
            balances: balances,
            poolState: defaultState,
            minPIssued: 0,
            maxValue: 0,
            allTokensHave: true,
            auth: auth,
            userAddress: localStorage.getItem("userAddress")!,
            eggAmount: 0
        }
    }

    depositOneTokenAndStake() {
        const toStake = Math.round(Number(this.state.eggAmount) * 10**8);

        globalSigner.signer.invoke({
            dApp: this.poolData.layer2Address,
            fee: 500000,
            payment: [
                {
                    assetId: this.poolData.baseTokenId,
                    amount: toStake
                }
            ],
            call: {
                function: 'generateIndexWithOneTokenAndStake',
                args: []
            },
            feeAssetId: 'WAVES',
        }).broadcast().then((tx: any) => successMessage("You successfully performed deposit.")).catch((tx: any) => errorMessage(JSON.stringify(tx)));
    }

    async downloadState(){
        const data: Array<IContractStateKey> = (await axios.get(`${API_URL}/addresses/data/${this.poolData.contractAddress}`)).data;
        const dataMap = new Map();
        data.forEach((kv) => {
            dataMap.set(kv.key, kv.value);
        });
        this.setState({poolState: dataMap});
        return dataMap
    }

    calculateCurrentPrice(t1: number, t2: number, coef: number){
        return  Math.round(10000 * coef * (this.state.poolState.get("global_"+[this.poolData.tokenIds[t1]]+"_balance") / this.poolData.tokenShares[t1] / this.poolData.tokenDecimals[t1]) /
            (this.state.poolState.get("global_"+[this.poolData.tokenIds[t2]]+"_balance") / this.poolData.tokenShares[t2] / this.poolData.tokenDecimals[t2])) / 10000;
    }

    calculateLiquidity() {
        let n = 0;
        let sum = 0;
        const usdnId = this.poolData.tokenNames.indexOf("USDN");
        while (n < this.poolData.tokenNames.length) {
            sum += 100 * this.state.poolState.get("global_"+[this.poolData.tokenIds[n]]+"_balance")  * this.calculateCurrentPrice(usdnId, n, 1) / this.poolData.tokenDecimals[n];
            n = n + 1;
        }
        return Math.floor(sum) / 100;
    }

    async componentDidMount() {
        const state = await this.downloadState();
        this.setState({poolState: state})

        const baseTokenNum = this.poolData.tokenIds.indexOf(this.poolData.baseTokenId);
        const baseTokenName = this.poolData.tokenNames[baseTokenNum];
        if (this.dicBalances[baseTokenName]) {
            this.setState({eggAmount: this.dicBalances[baseTokenName].balance})
        }

        setInterval(() => {
            globalSigner.updateBalances()
        }, 5000)

        setInterval(() => {
            if (localStorage.getItem("userAddress")) {this.setState({auth: true})}
        }, 1000)
    }

    calculateDepositValue() {
        const baseTokenNum = this.poolData.tokenIds.indexOf(this.poolData.baseTokenId);
        const baseTokenName = this.poolData.tokenNames[baseTokenNum];
        return Math.round(100 * this.dicBalances[baseTokenName].value * (Number(this.state.eggAmount) / this.dicBalances[baseTokenName].balance)) / 100
    }

    render() {
        const totalIndexTokens = this.state.poolState.get("global_poolToken_amount") / 10**8
        let userIndexTokens = this.state.poolState.get(this.state.userAddress + "_indexStaked") / 10**8
        if (!userIndexTokens) {userIndexTokens = 0}
        const userLiquidityValue = Math.floor(this.calculateLiquidity() * userIndexTokens * 100 / totalIndexTokens) / 100

        const baseTokenNum = this.poolData.tokenIds.indexOf(this.poolData.baseTokenId);
        const baseTokenName = this.poolData.tokenNames[baseTokenNum];

        return <div className="addLiquidity">
            <div className="head">
                <h1>Deposit liquidity</h1>
                <p className="desc">Select the method of adding liquidity and enter the value</p>
            </div>

            <div className="methodChoice">
                <div className="choice first"><Link className="ignore-link" to="addLiquidity">
                    Multiple tokens
                </Link></div>
                <div className="choice chosen second">
                    With {baseTokenName} token
                </div>
            </div>

            <div className="poolChoice">
                <h2 className="preTitle">To</h2>
                <div className="poolDetails blockBody flex">
                    <div className="poolData">
                        <div className="poolName">Pool "{this.poolData.name}"</div>
                        <div className="poolValue">Total Index tokens:&nbsp;{totalIndexTokens} <span className="dollarValue">(${this.calculateLiquidity()})</span></div>
                        <div className="poolValue">Your Index tokens:&nbsp;{userIndexTokens} <span className="dollarValue">(${userLiquidityValue})</span></div>
                    </div>
                    <div className="buttonContainer">
                        {(this.state.auth) ? (<button className="withdraw"><Link to="invest">Change pool</Link></button>) : (<div></div>)}
                    </div>
                </div>
            </div>

            {(this.state.auth) ? (
                <div>
                    <div className="compositionChoice">
                        <div className="poolDetails blockBody">
                            <div className="flex">
                                <div className="poolData flex">
                                    <img src={this.poolData.tokenLogos[baseTokenNum]} alt=""/>
                                    <div>
                                        <div className="poolName">{baseTokenName}</div>
                                        <div className="poolValue dollarValue">Max: {valueOrZero(this.dicBalances[baseTokenName].balance)}</div>
                                    </div>
                                </div>
                                    <input onChange={(e) => {this.setState({eggAmount: strToNum(e.target.value)})}} className="classicInput" id="eggAmountInput" defaultValue={valueOrZero(this.dicBalances[baseTokenName].balance)} type="text"/>
                            </div>
                            <div className="explanation flex">
                                <img src={attentionImg} className="attentionImg" alt="attentione"/>
                                Your token will be automatically converted to other pool tokens and provided as liquidity.
                                Please pay attention that value of your deposit can change if share token prices fluctuate.
                                <br/>
                                Because of slippage we don't recommend to invest more than $1000 with one transaction!
                            </div>
                        </div>
                        <div className={this.state.allTokensHave ? "depositButtonContainer" : "hidden"}>
                            <button className="depositButton" onClick={() => {this.depositOneTokenAndStake()}}>
                                Convert and deposit <span className="">${this.calculateDepositValue()}</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="addLiquidity__login">
                    <p className="addLiquidity__login-desc">Login to provide liquidity</p>

                    <button onClick={() => {simulateMouseClick(document.getElementById("login")!)}} className="login-button button primary medium">Login</button>

                </div>
            )}
        </div>
    }

}