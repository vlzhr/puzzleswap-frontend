import React from "react";
import axios from 'axios';
import {PoolNames, poolsData} from "./Pools";
import { Link } from "react-router-dom";
import {API_URL, IContractStateKey} from "./MultiSwapInterface";
import {store} from "react-notifications-component";
import comingSoon from "./img/comingSoon.svg"
import {globalSigner} from "./SignerHandler";
import {errorMessage, successMessage} from "./AuthInterface";

export function toDateString(timestamp: number) {
    const d = new Date(timestamp)
    return d.getDate() + "." + (d.getUTCMonth() + 1) + "." + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
}

export function valueOrZero(n: number) {
    return n ? n : 0;
}

interface IState{
    percentage: Number;
    balances: any;
    poolState: any;
    poolBalances: any;
    minPIssued: Number;
    maxValue: Number;
    userAddress: String
}

interface IProps{
    poolName: string;
}

export class InvestToPoolInterface extends React.Component<IProps, IState> {

    poolData: any = {};
    dicBalances: any = {};

    constructor(props: any) {
        super(props)

        const balances = JSON.parse(localStorage.getItem('userBalances') as String as "{}");
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
            poolBalances: defaultState,
            minPIssued: 0,
            maxValue: 0,
            userAddress: localStorage.getItem("userAddress")!
        }
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

    async downloadBalances(){
        const data: any = (await axios.get(`${API_URL}/assets/balance/${this.poolData.contractAddress}`)).data;
        const dataMap = new Map();
        data.balances.forEach((kv: any) => {
            dataMap.set(kv.assetId, kv.balance);
        });
        this.setState({poolBalances: dataMap});
        return dataMap
    }

    async componentDidMount() {
        const state = await this.downloadState();
        this.setState({poolState: state})

        const balances = await this.downloadBalances();
        this.setState({poolBalances: balances})
    }

    claimAllRewards() {
        globalSigner.signer.invoke({
            dApp: this.poolData.contractAddress,
            fee: 500000,
            payment: [],
            call: {
                function: 'claimIndexRewards',
                args: []
            },
            feeAssetId: 'WAVES',
        }).broadcast().then((tx: any) => successMessage("You successfully claimed rewards.")).catch((tx: any) => errorMessage(JSON.stringify(tx)));
    }

    withdrawAll() {
        globalSigner.signer.invoke({
            dApp: this.poolData.layer2Address,
            fee: 500000,
            payment: [],
            call: {
                function: 'unstakeAndRedeemIndex',
                args: [{
                    "type": "integer",
                    "value": valueOrZero(this.state.poolState.get(this.state.userAddress + "_indexStaked"))
                }]
            },
            feeAssetId: 'WAVES',
        }).broadcast().then((tx: any) => successMessage("Withdrawal went successful.")).catch((tx: any) => errorMessage(JSON.stringify(tx)));
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

    calculateTokenAvailableReward(tokenName: string) {
        const tokenNum = this.poolData.tokenNames.indexOf(tokenName)
        const tokenId = this.poolData.tokenIds[tokenNum]
        const decimals = this.poolData.tokenDecimals[tokenNum]

        const balanceToDistr1 = this.state.poolBalances.get(tokenId) - this.state.poolState.get("global_" + tokenId + "_balance");
        const tokenBalanceLastCheck = Number(this.state.poolState.get("global_lastCheck_" + tokenId + "_earnings"));
        const newEarnings = Math.max(balanceToDistr1, tokenBalanceLastCheck) - tokenBalanceLastCheck;

        console.log(tokenName, newEarnings)

        const totalStaked = this.state.poolState.get("global_indexStaked");
        const currentInterest = totalStaked == 0 ? 0 : this.state.poolState.get("global_lastCheck_" + tokenId + "_interest") +
            (newEarnings * decimals / totalStaked)

        const lastCheckUserInterestVal = this.state.poolState.get(this.state.userAddress + "_lastCheck_" + tokenId + "_interest");
        const lastCheckUserInterest = lastCheckUserInterestVal ? lastCheckUserInterestVal : 0

        console.log(currentInterest, lastCheckUserInterest, currentInterest - lastCheckUserInterest)
        console.log(this.state.poolState.get(this.state.userAddress + "_indexStaked"))

        const tokenBalance = Math.floor(
               (currentInterest - lastCheckUserInterest) * this.state.poolState.get(this.state.userAddress + "_indexStaked") / 10**8)
                / decimals


        const usdnId = this.poolData.tokenNames.indexOf("USDN")
        const tokenValue = tokenBalance * this.calculateCurrentPrice(usdnId, this.poolData.tokenNames.indexOf(tokenName), 1)


        if (!tokenBalance) {
            return {balance: 0, value: 0}
        } else {
            return {balance: tokenBalance, value: Math.floor(tokenValue * 100) / 100}
        }
    }

    calculateTotalRewardValue() {
        let reward = 0;
        for (const tokenName of this.poolData.tokenNames) {
            reward += this.calculateTokenAvailableReward(tokenName).value
        }
        return Math.floor(reward * 100) / 100
    }

    renderTokenReward(tokenName: string) {
        const tokenNum = this.poolData.tokenNames.indexOf(tokenName);

        const tokenData = this.calculateTokenAvailableReward(tokenName)

        return <div className="tokenDeposit">
            <div className="tokenDeposit__lc">
                <img className="tokenDeposit__smallLogo" src={this.poolData.tokenLogos[tokenNum]} alt=""/>
                <div className="tokenDeposit__lc-desc">
                    <div className="tokenDeposit__tokenName">{tokenName}</div>
                </div>
            </div>
            <div className="tokenDeposit__rc">
                <div className="tokenDeposit__poolValue">{tokenData.balance} <span className="dollarValue">($ {tokenData.value})</span></div>
            </div>
        </div>
    }

    render() {
        const userClaimedValueVal = this.state.poolState.get(this.state.userAddress + "_claimedRewardValue")
        const userClaimedValue = userClaimedValueVal ? userClaimedValueVal : 0;
        const userLastClaim = this.state.poolState.get(this.state.userAddress + "_lastClaim")

        return <div className="investToPool">

            <div className="column">
                <h1>{this.poolData.name} Mega Pool</h1>

                <div className="portfolio block">
                    <div className="preTitle">Your liquidity</div>
                    <div className="blockBody">
                        <div className="flex">
                            <div className="columnFlex">
                                <div className="subPreTitle">Index balance</div>
                                <div className="bigNumber">{valueOrZero(this.state.poolState.get(this.state.userAddress + "_indexStaked") / 10**8)}</div>
                            </div>
                            <div className="columnFlex">
                                <div className="subPreTitle">Value</div>
                                <div className="bigNumber">$ {valueOrZero(Math.floor(this.calculateLiquidity() * this.state.poolState.get(this.state.userAddress + "_indexStaked") / this.state.poolState.get("global_poolToken_amount") * 100) / 100)}</div>
                            </div>
                        </div>

                        <div className="flex">
                            <button className="withdraw" onClick={() => this.withdrawAll()}>Withdraw all</button>
                            <button><Link to="./addLiquidity">Deposit</Link></button>
                        </div>
                            {/*<div className="withdraw left-small">Withdraw as EGG <img className="comingSoon" src={comingSoon} alt=""/></div>*/}

                        <br/>
                        <div className="subPreTitle columnFlex">
                            <div>Total reward claimed:</div><div className="dollarValue bigNumber">${userClaimedValue / 10**6}</div>
                        </div>
                    </div>
                </div>

                <div className="rewards block">
                    <div className="preTitle">Rewards to claim
                        {userLastClaim ? <div className="preTitle-after">Unclaimed since {toDateString(userLastClaim)}</div> : <div></div>}
                    </div>
                    <div className="blockBody">
                        <div className="blockBodyHead flex">
                            <div className="columnFlex">
                                <div className="subPreTitle">Total value</div>
                                <div className="mediumNumber">$ {this.calculateTotalRewardValue()}</div>
                            </div>
                            <div>
                                <button onClick={() => this.claimAllRewards()}>Claim all</button>
                            </div>
                        </div>
                        <div>
                            <div className="smallTitle">
                                Reward composition
                            </div>
                            <div>
                                {this.poolData.tokenNames.map((tokenName: any) => (
                                    this.renderTokenReward(tokenName)
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    }
}