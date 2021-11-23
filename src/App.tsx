import React from 'react';
import './App.scss';
import './Landing.scss';
import './AddLiquidity.scss';
import {ExampleClass} from "./ExampleClass";
import {SwapInterface} from "./SwapInterface";
import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';
import ReactNotification from "react-notifications-component";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    NavLink,
    Redirect
} from "react-router-dom";
import { MultiSwapInterface } from './MultiSwapInterface';
import { LandingModule } from './LandingModule';
import {WalletModule} from "./WalletModule";
import puzzleLogo from "./img/puzzle-logo.svg";
import {AddLiquidityInterface} from "./AddLiquidityInterface";
import {InvestToPoolInterface} from "./InvestToPoolInterface";
import { globalSigner } from './SignerHandler';



declare global {
    interface Window {
        WavesKeeper: any
    }
}


function App() {

    const trackingId = "G-W203LN8Q6R";
    const history = createBrowserHistory();

    ReactGA.initialize(trackingId);
    history.listen(location => {
        ReactGA.pageview(window.location.pathname + window.location.search);
    });

  return (
      <Router>
        <div className="App">
            <header>
                <div className="header-menu">
                    <Link className="ignore-link" to="/"><img className="logo-image" src={puzzleLogo} /></Link>
                    <div className="topmenu">
                        <NavLink activeClassName="chosen" to="/farms"><span className="menu-element">Farms Pool 1</span></NavLink>
                        <NavLink activeClassName="chosen" to="/farms2"><span className="menu-element">Farms Pool 2</span></NavLink>
                        <NavLink activeClassName="chosen" to="/defi"><span className="menu-element">DeFi Pool</span></NavLink>
                    </div>
                </div>
                <div>
                    <WalletModule></WalletModule>
                </div>
            </header>
            <ReactNotification className="notificationWindow"/>

            <Switch>
                {/*<Route exact path="/pool-1" key={1}>*/}
                {/*    <MultiSwapInterface poolName="pool-1"/>*/}
                {/*</Route>*/}
                <Route exact path="/defi" key={4} children={<MultiSwapInterface poolName="defi"/>} />
                <Route exact path="/farms" key={1} children={<MultiSwapInterface poolName="farms"/>} />
                {/*<Route exact path="/farms/:tokenName" key={1} children={({ match }) => <MultiSwapInterface tokenName={match.params.tokenName} poolName="farms"/>} />*/}
                <Route exact path="/farms2" key={2} children={<MultiSwapInterface poolName="farms2"/>} />
                {/*<Route children={({ match }) => (*/}
                {/*    <SwapInterface matches={{...match} as any}/>*/}
                {/*)} path="/:domain" />*/}
                <Route exact path="/" key={3} children={<LandingModule />} />
                    {/*<Redirect to="/farms" />*/}


                <Route exact path="/farms/addLiquidity" key={5} children={<AddLiquidityInterface poolName="farms"/>} />
                <Route exact path="/farms2/addLiquidity" key={7} children={<AddLiquidityInterface poolName="farms2"/>} />

                <Route exact path="/farms/invest" key={6} children={<InvestToPoolInterface poolName="farms"/>} />
                <Route exact path="/farms2/invest" key={8} children={<InvestToPoolInterface poolName="farms2"/>} />

            </Switch>

            <footer>
                <a href="https://puzzlescan.com" target="_blank">Explorer</a>
                &nbsp;
                <a href="https://t.me/puzzle_swap" target="_blank">Trades&nbsp;notifications</a>
                &nbsp;
                <a href="https://dxd-team.xyz/puzzle/" target="_blank">Charts</a>
                &nbsp;
                <a onClick={() => globalSigner.logout()}>Logout</a>
            </footer>
        </div>
      </Router>
  );
}

export default App;
