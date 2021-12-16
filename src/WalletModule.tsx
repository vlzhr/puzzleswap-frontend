import React, {useState} from "react";
import {appTokens, downloadStates, PoolNames, poolsData} from "./Pools";
import {findAllByDisplayValue} from "@testing-library/react";
import {Button, Modal, ModalBody, ModalHeader, PopoverBody, UncontrolledPopover} from "reactstrap";
import {signerEmail, signerWeb, signerKeeper, globalSigner} from "./SignerHandler";
import axios from "axios";
import {API_URL, IContractStateKey} from "./MultiSwapInterface";
import arrow from "./img/arrow-blue.svg";
import balance from "./img/wallet-icon.svg";
import mail from "./img/mail.svg";
import seed from "./img/seed.svg";
import wx from "./img/wx.svg";
// import {AccountDropdown} from "./Account/AccountDropdown";

interface IState{
    address: string,
    wavesBalance: number,
    balances: any,
    signer: any,
    status: string,
    portfolioValue: number
}

interface IProps{
}


export function calculateTokenPrice(tokenInfo: any, states: any) {
    const token2Id = tokenInfo["tokenId"]
    const tokenId = "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p"

    const poolData = states[tokenInfo.contractAddress]

    return Math.round(10000 * 0.98 *
        ((poolData.get("global_"+tokenId+"_balance") / poolData.get("static_"+tokenId+"_weight")) / poolData.get("static_"+tokenId+"_scale")) /
        ((poolData.get("global_"+token2Id+"_balance") / poolData.get("static_"+token2Id+"_weight")) / poolData.get("static_"+token2Id+"_scale"))
    ) / 10000;
}

function calculateTokenValue(tokenInfo: any, states: any) {
    const tokenIn = tokenInfo["tokenId"]
    const tokenOut = "DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p"
    const poolData = states[tokenInfo.contractAddress]

    const coef = 0.98
    const BalanceOut = poolData.get("global_"+tokenOut+"_balance")
    const BalanceIn = poolData.get("global_"+tokenIn+"_balance")
    const amountIn = tokenInfo.balance
    const scaleIn = poolData.get("static_"+tokenIn+"_scale")
    const scaleOut = poolData.get("static_"+tokenOut+"_scale")
    const weightIn = poolData.get("static_"+tokenIn+"_weight")
    const weightOut = poolData.get("static_"+tokenOut+"_weight")

    const amountOut = BalanceOut / scaleOut *
        (1 - (BalanceIn / (BalanceIn + scaleIn * amountIn))
            ** (weightIn / weightOut))
    return Math.floor(amountOut * 2 * coef) / 2
}


export class WalletModule extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        console.log(props);

        this.state = {
            address: "",
            wavesBalance: 0,
            portfolioValue: 0,
            balances: {},
            signer: null,
            status: "nonauth"
        }
    }

    componentDidMount() {
        if (window.localStorage.getItem("userAddress") && window.localStorage.getItem("userBalances")) {
            this.setState({address: window.localStorage.getItem("userAddress")!})
            const balances = JSON.parse(window.localStorage.getItem("userBalances")!)
            let sum = 0
            balances.map((x: any) => sum += x.value)

            this.setState({balances: balances})
            this.setState({portfolioValue: sum})
            this.setState({status: "authed"})


            setInterval(() => {
                globalSigner.updateBalances().then((balances) => {
                    this.setState({address: window.localStorage.getItem("userAddress")!})
                    // const balances = JSON.parse(window.localStorage.getItem("userBalances")!)
                    let sum = 0
                    balances.map((x: any) => sum += x.value)

                    this.setState({balances: balances})
                    this.setState({portfolioValue: sum})
                    this.setState({status: "authed"})
                })
            }, 5000)
        }

    }

    displayFormat(address: string) {
        return address.slice(0, 6) + "...." + address.slice(address.length-4, address.length)
    }

    wavesFormat(n: number) {
        return Math.floor(n * 10**4) / 10**4
    }

    valueFormat(n: number) {
        const s = String(Math.floor(n * 10**2) / 10**2)
        if (s.split(".").length != 2) {
            return s + ".00"
        } else if (s.split(".")[1].length == 1) {
            return s + "0"
        } else { return s }
    }

    async handleLogin(signer: any) {
        const states = await downloadStates()

        this.setState({signer: signer})
        signer.login().then((data: any) => {
            this.setState({address: data.address})
            console.log(data)
        }).then(() => {
            signer.getBalance().then((data: any) => {
                this.setState({wavesBalance: Number(data[0]["amount"]) / 10**8})

                let balances: any = []
                for (const asset of data) {
                    if (appTokens.hasOwnProperty(asset.assetId)) {
                        const assetInfo = appTokens[asset.assetId]
                        assetInfo["balance"] = Number(asset["amount"]) / assetInfo["decimals"]
                        assetInfo["value"] = calculateTokenPrice(assetInfo, states) * assetInfo["balance"]
                        balances.push(assetInfo)
                    }
                }
                balances = balances.sort((x: any, y: any) => (y.value - x.value))
                let sum = 0
                balances.map((x: any) => sum += x.value)

                this.setState({balances: balances})
                this.setState({portfolioValue: sum})

                localStorage.setItem("userBalances", JSON.stringify(balances))
            })
        }).then(() => {
            localStorage.setItem("userAddress", this.state.address)
            this.setState({"status": "authed"})
        })
    }

    renderTokenBalance(tokenId: any) {
        const item = this.state.balances[tokenId]
        return (
            <div className="tokenBalance">
                <div>
                    <img src={item.logo} className="smallLogo" />
                    <span className="tokenBalance-balance">{this.wavesFormat(item.balance)}</span>
                </div>
                <div>
                    <span className="tokenBalance-value">${this.valueFormat(item.value)}</span>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="wallet-module">
                <button className={this.state.status == "authed" ? "open wallet-widget" : "non-visible"}
                     onClick={(e) => e.currentTarget.focus()} id="PortfolioFocus" type="button">
                    <span className="portfolio-value">
                        <img className="arrow-portfolio" src={balance} alt=""/>
                        ${this.valueFormat(this.state.portfolioValue)}<img className="arrow-portfolio" src={arrow} alt=""/>
                    </span>
                    {/*<span className="balance">{this.wavesFormat(this.state.wavesBalance)} <img className="waves-logo" src="https://s2.coinmarketcap.com/static/img/coins/200x200/1274.png" alt="waves logo"/></span>*/}
                </button>
                    <button className={this.state.status == "authed" ? "button secondary medium address" : "non-visible"} onClick={() => globalSigner.logout()}>
                        {/*<button className={this.state.status == "authed" ? "button secondary medium address" : "non-visible"} onClick={() => <AccountDropdown setShowAccount={} setIsAuthPopupOpen={} address={} logout={}}>*/}
                        {this.displayFormat(this.state.address)}
                        <img className="arrow-portfolio" src={arrow} alt=""/>
                    </button>
                
                {/*//globalSigner.logout()*/}

                <UncontrolledPopover className="wallet-popup infoPopup" trigger="focus" placement="bottom" target="PortfolioFocus">
                    {Object.keys(this.state.balances).map((item: any) => (
                        this.renderTokenBalance(item)
                    ))}
                </UncontrolledPopover>

                <button onClick={() => {this.setState({status: "authOpen"})}} id="login" className={this.state.status == "authed" ? "non-visible" : "open button primary medium"}>Connect wallet</button>

                <Modal toggle={() => {this.setState({"status": "nonauth"})}} isOpen={this.state.status == "authOpen"} className={"auth-window mt-5"}>
                    <ModalHeader toggle={() => {this.setState({"status": "nonauth"})}}>Connect wallet</ModalHeader>
                    <ModalBody className="text-center">
                        <button className="button secondary large wide button__icon"
                            onClick={() => {globalSigner.auth("email"); this.handleLogin(globalSigner.signer);}}>Waves Exchange Email
                            <img className="button__icon-image" src={mail} alt=""/>
                        </button>
                        <button className="button secondary large wide button__icon"
                            onClick={() => {globalSigner.auth("seed"); this.handleLogin(globalSigner.signer);}}>Waves Exchange Seed
                            <img className="button__icon-image" src={seed} alt=""/>
                        </button>
                        <button className="button secondary large wide button__icon"
                            onClick={() => {globalSigner.auth("keeper"); this.handleLogin(globalSigner.signer);}}>Waves Keeper
                            <img className="button__icon-image" src={wx} alt=""/>
                        </button>
                    </ModalBody>
                </Modal>
            </div>
        )
    }
}