import React from "react";
import landingImage from './img/landing-image1.png';
import fomoLogo from "./img/fomo-logo.jpeg";
import {appTokens, downloadStates} from "./Pools";
import {calculateTokenPrice} from "./WalletModule";
import { Link } from "react-router-dom";
import axios from "axios";
import mediumLogo from "./img/medium-logo.svg";
import {API_URL} from "./MultiSwapInterface";
import adv1 from "./img/adv1.png";
import adv2 from "./img/adv2.png";
import adv3 from "./img/adv3.png";
import adv4 from "./img/adv4.png";
import bannerToken from "./img/banner-token.png";

interface IState{
    data: any;
}

interface IProps{
}


export async function loadMainData() {
    const states = await downloadStates();
    const tokens = [];
    for (const tokenName of Object.keys(appTokens)) {
        const token = appTokens[tokenName];
        if (tokens.concat(['C1iWsKGqLwjHUndiQ7iXpdmPum9PeCDFfyXBdJJosDRS',
            'DG2xFkPdDwKUoBkzGAhQtLpSGzfXLiCYPEzeKH2Ad24p']).indexOf(token.tokenId) < 0) {
            token["balance"] = Number(token["amount"]) / token["decimals"]
            token["price"] = Math.floor(100 * calculateTokenPrice(token, states)) / 100
            tokens.push(token)
        }
    }
    tokens.sort((a: any, b: any) => (b.price - a.price))

    const ducksApi = (await axios.get("https://wavesducks.com/api/v1/collective-farms")).data;
    const tokenAddress: any = {}
    for (const i of ducksApi) {
        tokenAddress[i.shareAssetId] = i.contract
    }

    const duxplorerApi = (await axios.get("https://duxplorer.com/collective/json")).data;
    for (const i of ducksApi) {
        tokenAddress[i.shareAssetId] = i.contract
    }

    return {tokens: tokens};
}

export class LandingModule extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {data: {tokens: []}}
    }

    componentDidMount() {
        loadMainData().then((data) => {
            this.setState({data: data})
        })
    }

    renderPriceRow(itemName: any) {
        const item = this.state.data.tokens[itemName];
        console.log(item)
        return <div className="table-body table-row">
            <div className="table-cell">
                <img src={item.logo} alt="" className="prices-logo" /><span>{item.name}</span>
            </div>
            <div className="table-cell">${item.price}</div>
            {/*<div className="table-cell">+ 115%</div>*/}
            <div className="table-cell">
                <Link className="ignore-link" to={"/"+item.pool}><button>Trade</button></Link>
            </div>
        </div>
    }

    render() {
        return <div className="landing">
            <div className="block-1">
                <div className="block-1-left">
                    <h1>Decentralized&nbsp;exchange <br/>
                        of a newer generation</h1>
                    <p>Trade tokens in multiple mega pools</p>
                    <Link to="/defi"><button>Trade</button></Link>
                </div>
                <div className="landing-image-container">
                    <img className="landing-image" src={landingImage} alt=""/>
                </div>
                <div className="block-1-more" onClick={() => window.open("https://medium.com/@izhur27/what-is-puzzle-swap-1e4b4af4ed17")}>
                    Learn more on
                    <img src={mediumLogo} alt=""/>
                </div>
            </div>
            <div className="about-block">
                <h1>Solving multiple pain points and market needs</h1>
                <div className="advantages">
                    <div className="advantage">
                        <img src={adv1} alt=""/>
                        <h2>Mega pools</h2>
                        <p>Trade up to 10 tokens in one pool without extra fees and lower slippage risks. Any token can be exchanged to any other.</p>
                    </div>
                    <div className="advantage">
                        <img src={adv2} alt=""/>
                        <h2>Portfolio pools</h2>
                        <p>Create a custom trading pool and provide liquidity from your portfolio with any token which is suitable for you.</p>
                    </div>
                    <div className="advantage">
                        <img src={adv3} alt=""/>
                        <h2>Fair routing</h2>
                        <p>Suitable routing service between custom pools and AMM-exchanges on Waves — trade with the best fare.</p>
                    </div>
                    <div className="advantage">
                        <img src={adv4} alt=""/>
                        <h2>Trading&nbsp;subscriptions</h2>
                        <p>Purchase subscriptions with PUZZLE to pay less fees if you are a regular user.</p>
                    </div>
                </div>
            </div>
            <div className="banner">
                <div className="banner-left">
                    <div>
                        PUZZLE token will <br/>
                        be released soon!
                    </div>
                    <div>
                        <button onClick={() => {window.open("https://medium.com/@puzzleswap/puzzle-swap-%EF%B8%8F-roadmap-d8629c2dd166")}}>
                            Learn more
                        </button>
                    </div>
                </div>
                <div>
                    <img src={bannerToken} alt=""/>
                </div>
            </div>
            <div className="traders-block">
                <h1>Trade the best performing tokens</h1>
                <p>Trade any share tokens and earn on holding them.
                    Learn more on <a href="https://collective.wavesducks.com" target="_blank">collective.wavesducks.com</a></p>

                <div className="prices-block" >

                    <div className="table-head table-row">
                        <div className="table-cell">Asset</div>
                        <div className="table-cell">Price</div>
                        {/*<div className="table-cell">APY</div>*/}
                        <div className="table-cell"></div>
                    </div>

                    {Object.keys(this.state.data.tokens).map((x: any) => (this.renderPriceRow(x)))}

                    {/*<div className="table-body table-row">*/}
                    {/*    <div className="table-cell">*/}
                    {/*        <img src={fomoLogo} alt="" className="prices-logo" /> FOMO*/}
                    {/*    </div>*/}
                    {/*    <div className="table-cell">$1440</div>*/}
                    {/*    <div className="table-cell">+ 115%</div>*/}
                    {/*    <div className="table-cell">*/}
                    {/*        <button>Trade</button>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                </div>
            </div>
        </div>
    }
}