import React from "react";
import axios from 'axios';
import {appTokens, PoolNames, poolsData} from "./Pools";
import { Link } from "react-router-dom";
import {API_URL, IContractStateKey} from "./MultiSwapInterface";
import comingSoon from "./img/comingSoon.svg"
import {globalSigner} from "./SignerHandler";
import {Button, Modal, ModalBody, ModalHeader} from "reactstrap";
import {auth} from "@waves/waves-transactions";
import {errorMessage, successMessage} from "./AuthInterface";

interface IState{
    percentage: Number;
    balances: any;
    poolState: any;
    minPIssued: Number;
    maxValue: Number;
    allTokensHave: Boolean;
    userAddress: String;
    auth: Boolean
}

interface IProps{
    poolName: string;
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

export class AddLiquidityInterface extends React.Component<IProps, IState> {

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
            userAddress: localStorage.getItem("userAddress")!
        }
    }

    depositAndStake() {
        const payments = []
        for (const name of this.poolData.tokenNames) {
            payments.push({
                assetId: this.dicBalances[name].tokenId,
                amount: Math.floor(Math.floor(this.calculateTokenToDeposit(name) * Number(this.state.percentage) * 0.01 * this.dicBalances[name].decimals))
            })
        }
        console.log(payments)
        globalSigner.signer.invoke({
            dApp: this.poolData.layer2Address,
            fee: 500000,
            payment: payments,
            call: {
                function: 'generateIndexAndStake',
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

    calculateMinPIssued() {
        const poolState = this.state.poolState;

        let minPIssued = 100000000000;
        for (const name of this.poolData.tokenNames) {
            if (this.dicBalances[name] != undefined) {
                const tokenId = this.dicBalances[name].tokenId;
                const userTokenBalance = this.dicBalances[name].balance * this.dicBalances[name].decimals;
                const globalTokenBalance = poolState.get("global_" + tokenId + "_balance");
                const poolTokenAmount = poolState.get("global_poolToken_amount");

                let tokenMaxPIssued = Math.floor(this.dicBalances[name].decimals * poolTokenAmount * userTokenBalance / globalTokenBalance) / this.dicBalances[name].decimals;

                // console.log(globalTokenBalance, userTokenBalance, poolTokenAmount)
                console.log(tokenMaxPIssued);

                minPIssued = Math.min(tokenMaxPIssued, minPIssued);
            } else {
                this.setState({allTokensHave: false})
            }
        }

        console.log(minPIssued, " indexes to be issued max");
        return minPIssued;
    }

    async componentDidMount() {
        const state = await this.downloadState();
        this.setState({poolState: state})

        const minPIssued = this.calculateMinPIssued()
        this.setState({minPIssued: minPIssued})

        setInterval(() => {
            globalSigner.updateBalances()
        }, 5000)

        setInterval(() => {
            if (localStorage.getItem("userAddress")) {this.setState({auth: true})}
        }, 1000)
    }

    calculateTokenToDeposit(tokenName: any) {
        const tokenNum = this.poolData.tokenNames.indexOf(tokenName);
        const tokenId = this.poolData.tokenIds[tokenNum];
        const minPIssued = this.state.minPIssued;
        const poolTokenAmount = this.state.poolState.get("global_poolToken_amount");
        const Bk = this.state.poolState.get("global_"+tokenId+"_balance");

        const Dk = ((poolTokenAmount + minPIssued) / poolTokenAmount - 1) * Bk / this.poolData.tokenDecimals[tokenNum]

        return Math.floor(this.poolData.tokenDecimals[tokenNum] * Dk) / this.poolData.tokenDecimals[tokenNum];
    }

    calculateDepositValue() {
        return Math.floor(100 * Number(this.state.percentage) * 0.01 * this.calculateLiquidity() * Number(this.state.minPIssued) / Number(this.state.poolState.get("global_poolToken_amount"))) / 100
    }

    renderTokenDeposit(tokenName: any) {
        const tokenNum = this.poolData.tokenNames.indexOf(tokenName);
        const tokenDetails = (this.dicBalances[tokenName] != undefined ? this.dicBalances[tokenName] : {balance: 0, value: 0})

        const tokenBalance = tokenDetails["balance"];
        const tokenWeight = this.poolData.tokenShares[tokenNum] * 100
        const tokenToDeposit = Math.floor(this.poolData.tokenDecimals[tokenNum] * this.calculateTokenToDeposit(tokenName) * Number(this.state.percentage) / 100) / this.poolData.tokenDecimals[tokenNum];

        if (tokenBalance > 0) {
            const tokenDollarValue = Math.floor(tokenDetails["value"] * 100) / 100;

            return <div className="tokenDeposit">
                <div>
                    <div className="tokenWeight">{tokenWeight}%</div>
                    <img className="smallLogo" src={this.poolData.tokenLogos[tokenNum]} alt=""/>
                    <div className="tokenName">{tokenName}</div>
                </div>
                <div>
                    <div className="poolValue">{tokenToDeposit} <span className="dollarValue">/{tokenBalance}</span></div>
                </div>
            </div>
        } else {
            return <div className="tokenDeposit">
                <div>
                    <div className="tokenWeight">{tokenWeight}%</div>
                    <img className="smallLogo" src={this.poolData.tokenLogos[tokenNum]} alt=""/>
                    <div className="tokenName">{tokenName}</div>
                </div>
                <div>
                    <div className="notEnough"><Link to="./"><span>buy {tokenToDeposit} tokens</span></Link></div>
                </div>
            </div>
        }
    }

    handleRangeChange(e: any) {
        const inputValue = e.target.value;
        this.setState({percentage: inputValue});
    }

    render() {
        const totalIndexTokens = this.state.poolState.get("global_poolToken_amount") / 10**8
        let userIndexTokens = this.state.poolState.get(this.state.userAddress + "_indexStaked") / 10**8
        if (!userIndexTokens) {userIndexTokens = 0}
        const userLiquidityValue = Math.floor(this.calculateLiquidity() * userIndexTokens * 100 / totalIndexTokens) / 100

        return <div className="addLiquidity">
            <div className="head">
                <h1>Deposit liquidity</h1>
                <p className="desc">Select the method of adding liquidity and enter the value</p>
            </div>

            <div className="methodChoice">
                <div className="choice chosen first">
                    Multiple tokens
                </div>
                <div className="choice second" onClick={() => {window.open("https://t.me/PuzzleSwap")}}>
                    With EGG token <img className="comingSoon" src={comingSoon} />
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
                        {(this.state.auth) ? (<button className="withdraw"><Link to="invest">Manage</Link></button>) : (<div></div>)}
                    </div>
                </div>
            </div>

            {(this.state.auth) ? (
                <div>
                    <div className="amountChoice">
                        <h2 className="preTitle">Amount</h2>
                        <div className="blockBody">
                            <p className="desc">Select the percentage of your assets</p>
                            <div className="addAmountValue">{this.state.percentage}% <span className="dollarValue">($ {this.calculateDepositValue()})</span></div>
                            <input onInput={(e) => {this.handleRangeChange(e)}} className="chooseValue" type="range" min="0" max="100" step="0.1" />
                        </div>
                    </div>

                    <div className="compositionChoice">
                        <h2 className="preTitle">Deposit composition</h2>
                        <div className="blockBody">
                            {this.poolData.tokenNames.map((item: any) => (
                                this.renderTokenDeposit(item)
                            ))}
                        </div>
                    </div>

                    <div className={this.state.allTokensHave ? "depositButtonContainer" : "hidden"}>
                        <button className="depositButton" onClick={() => {this.depositAndStake()}}>
                            Deposit <span className="">$ {this.calculateDepositValue()}</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <p className="desc">Login to provide liquidity</p>

                    <button onClick={() => {simulateMouseClick(document.getElementsByClassName("main-login-button")[0]!)}} className="login-button">Login</button>

                </div>
            )}
        </div>
    }

}