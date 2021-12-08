import React, {useState} from "react";
import axios from 'axios';
import {PoolNames, poolsData} from "./Pools"
import classNames from "classnames";
import ModalWindow from "./AuthInterface";
import changeButton from './img/ChangeButton.svg';
import streetLogo from './img/street-logo.svg';
import usdnLogo from './img/usdn-logo.svg';
import puzzleBack from './img/puzzle-back-1.svg';
import arrow from './img/arrow.svg';
import {Modal, ModalBody, ModalHeader, PopoverBody, UncontrolledPopover} from "reactstrap";
import { Link } from "react-router-dom";
import {createBrowserHistory} from "history";
import ReactGA from "react-ga";

export const logos = [streetLogo, usdnLogo]

export const API_URL = 'https://wavesducks.wavesnodes.com'

interface IState{
    data: Map<any, any>;
    tokenOut: number;
    amountIn: number;
    tokenIn: number;
}

interface IProps{
    poolName: string;
    // tokenName: string;
}

export interface IContractStateKey{
    key: string;
    value: number | boolean | string;
    type: 'integer' | 'string' | 'boolean';
}
//
// function RotateIcon(this: any) {
//
//     const [isChanged, setChanged] = useState(false);
//
//     const toggleClass = () => {
//         setChanged(!isChanged);
//     };
//
//     return;
// }

export class MultiSwapInterface extends React.Component<IProps, IState>{

    poolData: any = {};

    constructor(props: any) {
        super(props);
        console.log(props);
        const poolName = props.poolName as PoolNames;
        this.poolData = poolsData[poolName];
        this.poolData.poolName = poolName;
        console.log(poolName, poolsData, this.poolData);
        this.state = {
            data: new Map<any, any>(),
            tokenOut: this.poolData.tokenNames.length - 1,
            amountIn: 0,
            tokenIn: 1
        }
    }

    async componentDidMount() {
        const s = await this.downloadState()
        this.setState({
            data: s
        })
        setInterval(async () => {
            const s = await this.downloadState()
            this.setState({
                data: s
            })
        }, 5000);

    }

    async downloadState(){
        const data: Array<IContractStateKey> = (await axios.get(`${API_URL}/addresses/data/${this.poolData.contractAddress}`)).data;
        const dataMap = new Map();
        data.forEach((kv) => {
            dataMap.set(kv.key, kv.value);
        });
        return dataMap
    }

    calculateCurrentPrice(t1: number, t2: number, coef: number){
        return  Math.round(10000 * coef * (this.state.data.get("global_"+[this.poolData.tokenIds[t1]]+"_balance") / this.poolData.tokenShares[t1] / this.poolData.tokenDecimals[t1]) /
                (this.state.data.get("global_"+[this.poolData.tokenIds[t2]]+"_balance") / this.poolData.tokenShares[t2] / this.poolData.tokenDecimals[t2])) / 10000;
    }

    calculateAmountOut(coef: number) {
        const tokenOut = this.state.tokenOut
        const tokenIn = this.getTokenIn();
        const BalanceIn = this.state.data.get("global_"+[this.poolData.tokenIds[tokenIn]]+"_balance")
        const BalanceOut = this.state.data.get("global_"+[this.poolData.tokenIds[tokenOut]]+"_balance")

        const amountOut = BalanceOut / this.poolData.tokenDecimals[tokenOut] *
            (1 - (BalanceIn / (BalanceIn + this.poolData.tokenDecimals[tokenIn] * this.state.amountIn))
            ** (this.poolData.tokenShares[tokenIn] / this.poolData.tokenShares[tokenOut]))
        return Math.floor(amountOut * this.poolData.tokenDecimals[tokenOut] * coef) / this.poolData.tokenDecimals[tokenOut]
    }

    calculateLiquidity() {
        let n = 0;
        let sum = 0;
        const usdnId = this.poolData.tokenNames.indexOf("USDN");
        while (n < this.poolData.tokenNames.length) {
            sum += 100 * this.state.data.get("global_"+[this.poolData.tokenIds[n]]+"_balance")  * this.calculateCurrentPrice(usdnId, n, 1) / this.poolData.tokenDecimals[n];
            n = n + 1;
        }
        return Math.floor(sum) / 100;
    }

    getTotalVolume() {
        return Math.floor(this.state.data.get("global_volume") * 100 / 1000000) / 100;
    }

    getTokenInBalance() {
        return this.state.tokenIn
    }

    getTokenIn() {
        return this.state.tokenIn;
    }

    handleInput(e: any) {
        const floatVal = parseFloat(e.target.value);
        const value = !isNaN(floatVal) ? floatVal : 0;
        this.setState({
            amountIn: value
        });
    }

    renderTokenChoice(tokenName: string, direction: string) {
        const n = this.poolData.tokenNames.indexOf(tokenName);
        return <div className="tokenChoice" onClick={() => {
                    if (direction == "in") {
                        this.setState({"tokenIn": n})
                    } else {
                        this.setState({"tokenOut": n})
                    }
                }}>
                <img className="tokenChoice-image" src={this.poolData.tokenLogos[n]} />
                <div className="tokenChoice-name">{tokenName}</div>
            </div>
    }

    render(){
        return <div>
            {this.poolData && <>
                <div className="swap-window">
                    <div className="banner">
                        <span>PUZZLE token is live 🧩🚀</span>
                        <br/>
                        {(this.poolData.contractAddress !== "3PFDgzu1UtswAkCMxqqQjbTeHaX4cMab8Kh") ?
                            (<Link to="puzzle">Trade.</Link>)
                            :
                            (<a href="https://t.me/PuzzleSwap" target="_blank">Join our chat.</a>)
                        }
                    </div>
                    <div>
                        <div className="comp">
                                <button onClick={(e) => e.currentTarget.focus()} className="infoIcon tokenData" id="TokenIn" type="button">
                                    <img className="tokenLogo" src={this.poolData.tokenLogos[this.getTokenIn()]}/>
                                    <div className="tokenPair">
                                        <div className="tokenName">
                                            <span className="tokenName-text">You pay</span>
                                            <span
                                                className="tokenName-name">{this.poolData.tokenNames[this.getTokenIn()]}
                                            </span>
                                        </div>
                                        <img className="arrow" src={arrow} alt=""/>
                                    </div>
                                </button>

                                <UncontrolledPopover className="custom-popover" trigger="click" placement="bottom" target="TokenIn">
                                        {this.poolData.tokenNames.map((item: any) => (
                                            this.renderTokenChoice(item,"in")
                                        ))}
                                </UncontrolledPopover>

                            <div>
                                <input onChange={(e) => this.handleInput(e)} type="text" placeholder="0"/>
                                {/*<div className="afterInput">max:&nbsp;${this.getTokenInBalance()}</div>*/}
                            </div>
                        </div>
                        <div className="change-button comp rate"
                             onClick={() => this.setState({tokenOut: this.state.tokenIn, tokenIn: this.state.tokenOut})}>
                            <img src={changeButton} alt="change"/>
                            <span className="rateText">
                                <span className="rateText">1 {this.poolData.tokenNames[this.getTokenIn()]} = {this.calculateCurrentPrice(this.state.tokenOut, this.getTokenIn(), 0.98)} {this.poolData.tokenNames[this.state.tokenOut]}</span>
                                {/*<br/>*/}
                                {/*<span className="rateText">1 {this.poolData.tokenNames[this.state.tokenOut]} = {this.calculateCurrentPrice(this.getTokenIn(), this.state.tokenOut)} {this.poolData.tokenNames[this.getTokenIn()]}</span>*/}
                            </span>
                        </div>
                        <div className="comp">
                            <button onClick={(e) => e.currentTarget.focus()} className="infoIcon tokenData" id="TokenOut" type="button">
                                <img className="tokenLogo" src={this.poolData.tokenLogos[this.state.tokenOut]}/>

                                <div className="tokenPair">
                                    <div className="tokenName">
                                        <span className="tokenName-text">You receive</span>
                                        <span
                                            className="tokenName-name">{this.poolData.tokenNames[this.state.tokenOut]}
                                        </span>
                                    </div>
                                    <img className="arrow" src={arrow} alt=""/>
                                </div>
                            </button>
                            <input disabled={true} placeholder={(this.calculateAmountOut(0.98)).toString()}/>


                            <UncontrolledPopover className="custom-popover" trigger="click" placement="bottom" target="TokenOut">
                                {this.poolData.tokenNames.map((item: any) => (
                                    this.renderTokenChoice(item,"out")
                                ))}
                            </UncontrolledPopover>

                        </div>

                        <ModalWindow poolData={this.poolData} tokenOut={this.state.tokenOut}
                                     toReceive={(this.poolData.contractAddress === "3PFDgzu1UtswAkCMxqqQjbTeHaX4cMab8Kh") ? 0 : Math.floor(this.calculateAmountOut(0.95) * this.poolData.tokenDecimals[this.state.tokenOut]) / this.poolData.tokenDecimals[this.state.tokenOut]}
                                     txData={{
                                         pmt: {
                                             assetId: this.poolData.tokenIds[this.getTokenIn()],
                                             amount: Math.floor(this.state.amountIn * this.poolData.tokenDecimals[this.getTokenIn()])
                                         },
                                         tokenOut: this.poolData.tokenIds[this.state.tokenOut]
                                     }}/>
                    </div>
                </div>
                <div className="pool-data">
                    <div>
                        <div className="poolliq-text">Pool liquidity:</div>
                        <div className="poolliq-value">${this.calculateLiquidity()}</div>
                    </div>
                    { (this.poolData.contractAddress !== "3PFDgzu1UtswAkCMxqqQjbTeHaX4cMab8Kh") ? (
                        <div>
                            <div className="poolliq-text">Pool volume:</div>
                            <div className="poolliq-value">${this.getTotalVolume()}</div>
                        </div>
                    ) : (
                        <div></div>
                    )
                    }
                    { this.poolData.layer2Address ? (
                        <div>
                            <Link to={"/"+this.poolData.poolName+"/addLiquidity"}><button className="absolute button primary medium">Add liquidity</button></Link>
                        </div>
                    ) : (
                        <img className="poolliq-image" src={puzzleBack}/>
                    )}
                </div>
            </>}
        </div>
    }
}