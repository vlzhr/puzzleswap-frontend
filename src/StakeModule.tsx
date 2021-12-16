import React, {useState} from "react";
import {API_URL, IContractStateKey} from "./MultiSwapInterface";
import axios from "axios";
import {toDateString, valueOrZero} from "./InvestToPoolInterface";
import payoutIcon from "./img/Payout.svg";
import {globalSigner, signerEmail, signerWeb} from "./SignerHandler";
import {errorMessage, successMessage} from "./AuthInterface";
import {simulateMouseClick} from "./AddLiquidityInterface";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import mail from "./img/mail.svg";
import seed from "./img/seed.svg";
import wx from "./img/wx.svg";
import puzzleLogo from "./img/logos/PUZZLE.svg";


interface IState{
    data: any,
    transactions: any,
    dicBalances: any,
    auth: boolean,
    height: number,
    formStatus: string,
    formAmount: number
}

interface IProps{
}

export const stakingAddress = "3PFTbywqxtFfukX3HyT881g4iW5K4QL3FAS"

export class StakeModule extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props);

        const defaultData = new Map();
        this.state = {
            data: defaultData,
            transactions: [],
            dicBalances: {},
            auth: false,
            height: 1610000,
            formStatus: "",
            formAmount: 0
        }

        let balances: [], auth: boolean = true;
        let balancesStr = localStorage.getItem('userBalances');
        if (!balancesStr) {
            balances = [];
            auth= false;
        } else {balances = JSON.parse(balancesStr)}
        for (const b of balances) {
            this.state.dicBalances[b["name"]] = b;
        }

        this.setState({auth: auth});
    }

    async componentDidMount() {
        const result = await axios.get(`${API_URL}/addresses/data/${stakingAddress}`);
        const data = result.data
        const dataMap = new Map();
        data.forEach((kv: any) => {
            dataMap.set(kv.key, kv.value);
        });
        this.setState({data: dataMap});

        window.setInterval(() => {

            let balances: [], auth: boolean = true;
            let balancesStr = localStorage.getItem('userBalances');
            if (!balancesStr) {
                balances = [];
                auth= false;
            } else {balances = JSON.parse(balancesStr)}
            for (const b of balances) {
                this.state.dicBalances[b["name"]] = b;
            }

            this.setState({auth: auth});

            axios.get(`${API_URL}/blocks/height`).then((result) => {
                    this.setState({height: result.data["height"]});
                }
            )

            axios.get(`${API_URL}/transactions/address/${stakingAddress}/limit/20`).then((result) => {
                    this.setState({transactions: result.data[0]});
                }
            )

        }, 1000)
    }

    claimRewards() {
        globalSigner.signer.invoke({
            dApp: stakingAddress,
            fee: 500000,
            payment: [],
            call: {
                function: 'claimReward',
                args: []
            },
            feeAssetId: 'WAVES',
        }).broadcast().then((tx: any) => successMessage("You successfully claimed staking rewards.")).catch((tx: any) => errorMessage(JSON.stringify(tx)));
    }

    stake() {
        globalSigner.signer.invoke({
            dApp: stakingAddress,
            fee: 500000,
            payment: [{
                assetId: "HEB8Qaw9xrWpWs8tHsiATYGBWDBtP2S7kcPALrMu43AS",
                amount: this.state.formAmount
            }],
            call: {
                function: 'stake',
                args: []
            },
            feeAssetId: 'WAVES',
        }).broadcast().then((tx: any) => successMessage("You successfully staked PUZZLE.")).catch((tx: any) => errorMessage(JSON.stringify(tx)));
    }

    unstake() {
        globalSigner.signer.invoke({
            dApp: stakingAddress,
            fee: 500000,
            payment: [],
            call: {
                function: 'unStake',
                args: [
                    {
                        type: "integer",
                        value: this.state.formAmount
                    }
                ]
            },
            feeAssetId: 'WAVES',
        }).broadcast().then((tx: any) => successMessage("You successfully removed PUZZLE from staking.")).catch((tx: any) => errorMessage(JSON.stringify(tx)));
    }

    renderTransaction(tx: any) {
        if (tx.call !== undefined && tx["stateChanges"]["invokes"][0] !== undefined) {
            const amount = tx["stateChanges"]["invokes"][0]["payment"][0]["amount"] / 10 ** 6
            const minutesAgo = this.state.height - tx.height

            return <div className="transactionData flex">
                <div className="flex">
                    <img className="transactionIcon" src={payoutIcon} alt=""/>
                    <div className="columnFlex">
                        <div className="transactionTitle">USDN Payout</div>
                        <div className="transactionDate">{minutesAgo > 0 ? (minutesAgo + " minutes ago") : ("just now")}</div>
                    </div>
                </div>
                <div className="">
                    <div className="transactionValue" onClick={() => {window.open("https://wavesexplorer.com/tx/" + tx.id)}}>+ {amount} USDN</div>
                </div>
            </div>
        }
    }

    handleInput(e: any) {
        const floatVal = parseFloat(e.target.value);
        const value = !isNaN(floatVal) ? Math.round(10**8 * floatVal) : 0;
        this.setState({
            formAmount: value
        });
    }

    render() {
        let userAddress, stakedAmount, currentInterest, lastCheckInterest,toClaimAmount,puzzleBalance;
        if (this.state.auth) {
            puzzleBalance = this.state.dicBalances["PUZZLE"] ? this.state.dicBalances["PUZZLE"].balance : 0;
            userAddress = localStorage.getItem("userAddress")
            stakedAmount = valueOrZero(this.state.data.get(userAddress + "_staked"))
            currentInterest = this.state.data.get("global_lastCheck_DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p_interest")
            lastCheckInterest = valueOrZero(this.state.data.get(userAddress + "_lastCheck_DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p_interest"))
            toClaimAmount = Math.floor((lastCheckInterest > 0 ? stakedAmount * (currentInterest - lastCheckInterest) : 0) / 10 ** 12) / 10 ** 6;
        }

        return <div className="addLiquidity stakeModule">

            <div className="head">
                <h1>PUZZLE Staking</h1>
                <p className="landing__desc">For every swap on the exchange, 0.4% fee is distributed as USDN to PUZZLE stakers proportionally to their staked balance.</p>
            </div>

            <div className="adapting-block">
                <div>
                    {this.state.auth ? (
                        <div className="balances">
                            <h2 className="preTitle">My balances</h2>
                            <div className="blockBody">
                                <div className="flex">
                                    <div className="columnFlex">
                                        <div className="dollarValue">Available to stake</div>
                                        <div
                                            className="value">{Math.floor(valueOrZero(puzzleBalance) * 10000) / 10000} PUZZLE
                                        </div>
                                    </div>
                                    <div className="columnFlex">
                                        <div className="dollarValue">Staked balance</div>
                                        <div
                                            className="name">{valueOrZero(this.state.data.get(userAddress + "_staked")) / 10 ** 8} PUZZLE
                                        </div>
                                    </div>
                                </div>
                                <div className="flex">
                                    <button onClick={() => this.setState({formStatus: "stake"})}>Stake PUZZLE</button>
                                    <button onClick={() => this.setState({formStatus: "unstake"})} className="withdraw">Unstake</button>
                                </div>
                            </div>

                            {this.state.formStatus === "stake" ? (<div className="stake-form swap-window">
                                <div className="">
                                    <div>
                                        <input onChange={(e) => this.handleInput(e)} type="text" placeholder="0"/>
                                    </div>
                                    <div>
                                        <button className="small" onClick={() => this.stake()}>Stake PUZZLE</button>
                                    </div>
                                </div>
                            </div>) : (this.state.formStatus === "unstake") ? (
                                <div className="stake-form swap-window">
                                    <div className="">
                                        <div>
                                            <input onChange={(e) => this.handleInput(e)} type="text" placeholder="0"/>
                                        </div>
                                        <div>
                                            <button className="small" onClick={() => this.unstake()}>Unstake PUZZLE</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div></div>
                            )}
                        </div>
                    ) : (
                        <div className="needAuth balances">
                            <div className="blockBody">
                                <div className="">
                                    <div className="dollarValue">Connect your wallet to see your stake balances</div>
                                    <button onClick={() => simulateMouseClick(document.getElementById("login")!)}>Connect wallet</button>
                                </div>
                            </div>
                        </div>
                    )
                    }
                </div>


                <div>
                    {this.state.auth ? (
                    <div className="overview">
                        <h2 className="preTitle">Overview</h2>
                        <div className="blockBody">
                            <div className="flex">
                                <div className="columnFlex">
                                    <div className="dollarValue">Claimed income</div>
                                    <div className="big-value">{valueOrZero(this.state.data.get(userAddress + "_DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p_claimed")) / 10**6} USDN</div>
                                </div>
                                <div className="columnFlex">
                                    <div className="dollarValue">Available to claim</div>
                                    <div className="big-value">{toClaimAmount} USDN</div>
                                </div>
                                <div>
                                    <button onClick={() => {this.claimRewards()}}>Claim</button>
                                </div>
                            </div>
                        </div>
                    </div>
                        ) : (<div></div>)}
                    {/*</div>*/}

                    <div className="history">
                        <h2 className="preTitle">Transactions history (total protocol fees)</h2>
                        <div className="blockBody">

                            {this.state.transactions.map((item: any) => (
                                this.renderTransaction(item)
                            ))}

                        </div>
                    </div>
                </div>
            </div>

        </div>
    }

}
