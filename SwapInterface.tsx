import React from "react";
import axios from 'axios';
import {PoolNames, poolsData} from "./Pools"
import classNames from "classnames";
import ModalWindow from "./AuthInterface";
import changeButton from './img/ChangeButton.svg';
import streetLogo from './img/street-logo.svg';
import usdnLogo from './img/usdn-logo.svg';
import puzzleBack from './img/puzzle-back-1.svg';

export const logos = [streetLogo, usdnLogo]

export const API_URL = 'https://wavesducks.wavesnodes.com'

interface IState{
    data: Map<any, any>;
    tokenOut: number;
    amountIn: number;
}

interface IProps{
    matches: {
        domain: string
    }
}

export interface IContractStateKey{
    key: string;
    value: number | boolean | string;
    type: 'integer' | 'string' | 'boolean';
}

export class SwapInterface extends React.Component<IProps, IState>{

    poolData: any = {};

    constructor(props: any) {
        super(props);
        console.log(props);
        const poolName = props.matches.params.domain as PoolNames;
        this.poolData = poolsData[poolName];
        console.log(poolName, poolsData, this.poolData);
        this.state = {
            data: new Map<any, any>(),
            tokenOut: 0,
            amountIn: 0
        }
    }

    async componentDidMount() {
        setInterval(async () => {
            const s = await this.downloadState()
            this.setState({
                data: s
            })
        }, 1000);
    }

    async downloadState(){
        const data: Array<IContractStateKey> = (await axios.get(`${API_URL}/addresses/data/${this.poolData.contractAddress}`)).data;
        const dataMap = new Map();
        data.forEach((kv) => {
            dataMap.set(kv.key, kv.value);
        });
        return dataMap
    }

    calculateCurrentPrice(t1: number, t2: number){
        return  Math.round(10000 * (this.state.data.get("global_"+[this.poolData.tokenIds[t1]]+"_balance") / this.poolData.tokenShares[t1] / this.poolData.tokenDecimals[t1]) /
                (this.state.data.get("global_"+[this.poolData.tokenIds[t2]]+"_balance") / this.poolData.tokenShares[t2] / this.poolData.tokenDecimals[t2])) / 10000;
    }

    calculateAmountOut(coef: number) {
        const tokenOut = this.state.tokenOut
        const tokenIn = this.state.tokenOut === 0 ? 1 : 0;
        const BalanceIn = this.state.data.get("global_"+[this.poolData.tokenIds[tokenIn]]+"_balance")
        const BalanceOut = this.state.data.get("global_"+[this.poolData.tokenIds[tokenOut]]+"_balance")

        const amountOut = BalanceOut / this.poolData.tokenDecimals[tokenOut] *
            (1 - (BalanceIn / (BalanceIn + this.poolData.tokenDecimals[tokenIn] * this.state.amountIn))
            ** (this.poolData.tokenShares[tokenIn] / this.poolData.tokenShares[tokenOut]))
        return Math.floor(amountOut * this.poolData.tokenDecimals[tokenOut] * coef) / this.poolData.tokenDecimals[tokenOut]
    }

    calculateLiquidity() {
        return Math.floor(
            100* (this.state.data.get("global_"+[this.poolData.tokenIds[1]]+"_balance") * 1 / this.poolData.tokenDecimals[1] +
            this.state.data.get("global_"+[this.poolData.tokenIds[0]]+"_balance") * this.calculateCurrentPrice(1, 0) / this.poolData.tokenDecimals[0])) / 100;

    }

    getTokenIn() {
        return this.state.tokenOut === 0 ? 1 : 0
    }

    handleInput(e: any) {
        const floatVal = parseFloat(e.target.value);
        const value = !isNaN(floatVal) ? floatVal : 0;
        this.setState({
            amountIn: value
        });
    }

    render(){
        return <div>
            {this.poolData && <>
                <div className="swap-window">
                    <div>
                        <div className="comp">
                            <div className="tokenData">
                                <img className="tokenLogo" src={logos[this.getTokenIn()]}/>
                                <div className="tokenName">
                                    <span className="tokenName-text">You pay</span>
                                    <span
                                        className="tokenName-name">{this.poolData.tokenNames[this.getTokenIn()]}</span>
                                </div>
                            </div>
                            <input onChange={(e) => this.handleInput(e)} type="text" placeholder="0"/>
                        </div>
                        <div className="change-button comp rate button secondary medium"
                             onClick={() => this.setState({tokenOut: [1, 0].indexOf(this.state.tokenOut)})}>
                            <img src={changeButton} alt="change"/>
                            <span
                                className="rateText">1 {this.poolData.tokenNames[0]} = {this.calculateCurrentPrice(1, 0)} {this.poolData.tokenNames[1]}</span>
                            {/*<span className="rateText">1 {tokenNames[this.getTokenIn()]} = {this.calculateCurrentPrice(this.state.tokenOut, this.getTokenIn())} {tokenNames[this.state.tokenOut]}</span>*/}
                            {/*<br/>*/}
                            {/*<span className="rateText">1 {tokenNames[this.state.tokenOut]} = {this.calculateCurrentPrice(this.getTokenIn(), this.state.tokenOut)} {tokenNames[this.getTokenIn()]}</span>*/}
                        </div>
                        <div className="comp">
                            <div className="tokenData">
                                <img className="tokenLogo" src={logos[this.state.tokenOut]}/>
                                <div className="tokenName">
                                    <span className="tokenName-text">You receive</span>
                                    <span
                                        className="tokenName-name">{this.poolData.tokenNames[this.state.tokenOut]}</span>
                                </div>
                            </div>
                            <input disabled={true} placeholder={(this.calculateAmountOut(0.98)).toString()}/>
                        </div>

                        <ModalWindow poolData={this.poolData} tokenOut={this.state.tokenOut}
                                     toReceive={Math.floor(this.calculateAmountOut(0.95) * this.poolData.tokenDecimals[this.state.tokenOut]) / this.poolData.tokenDecimals[this.state.tokenOut]}
                                     txData={{
                                         pmt: {
                                             assetId: this.poolData.tokenIds[this.getTokenIn()],
                                             amount: this.state.amountIn * this.poolData.tokenDecimals[this.getTokenIn()]
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
                    <img className="poolliq-image" src={puzzleBack}/>
                </div>
            </>}
        </div>
    }
}