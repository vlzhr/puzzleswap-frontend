/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React, { useState } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    PopoverBody,
    Popover, UncontrolledPopover
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-notifications-component/dist/theme.css'
import {signerEmail, signerWeb} from "./SignerHandler";
import { store } from 'react-notifications-component';
import mail from "./img/mail.svg";
import seed from "./img/seed.svg";
import wx from "./img/wx.svg";
import puzzleIcon from "./img/puzzle-icon-white.svg";
import openFull from "./img/open-full-icon.svg";
import newInfo from "./img/new-info-icon.svg";
import './App.scss';
import './Landing.scss';
import './AuthInterface.scss';

export const successMessage = (message: string) => {
    store.addNotification({
        title: "Congratulations!",
        message: message,
        // "<a target='_blank' href='https://wavesexplorer.com/transaction/"+tx.id+"}'>Swap transaction.</a>",
        type: "success",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {duration: 5000, onScreen: true}
    });
}

export const errorMessage = (message: string) => {
    store.addNotification({
        title: "Something went wrong",
        message: message,
        // "<a target='_blank' href='https://wavesexplorer.com/transaction/"+tx.id+"}'>Swap transaction.</a>",
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {duration: 5000, onScreen: true}
    });
}

const ModalWindow = (props: any) => {
    let buttonLabel = "Swap";
    let className = "modal-window";

    const pool = props.poolData;
    const txData = props.txData;

    const handleExchangePromise = (tx: any) => {
        store.addNotification({
            title: "Congratulations!",
            message: "You successfully performed an exchange.",
            // "<a target='_blank' href='https://wavesexplorer.com/transaction/"+tx.id+"}'>Swap transaction.</a>",
            type: "success",
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {duration: 5000, onScreen: true}
        });
        console.log(tx);
    }

    const handleExchangeError = (error: any) => {
        store.addNotification({
            title: "Error while completing exchange!",
            message: JSON.stringify(error),
            type: "danger",
            insert: "top",
            container: "top-right",
            animationIn: ["animate__animated", "animate__fadeIn"],
            animationOut: ["animate__animated", "animate__fadeOut"],
            dismiss: {duration: 5000, onScreen: true}
        });
        console.log(error)
    }

    const exchangeWithSigner = (txData: any, signer: any, minToReceive: number) => {
        return signer
            .invoke({
                dApp: pool.contractAddress,
                fee: 500000,
                payment: [txData.pmt],
                call: {
                    function: 'swap',
                    args: [
                        { "type": "string", "value": txData.tokenOut },
                        { "type": "integer", "value": minToReceive }
                    ],
                },
            })
            .broadcast()
            .then((tx: any) => handleExchangePromise(tx))
            .catch((error: any) => handleExchangeError(error) );
    }

    const exchangeWithKeeper = (txData: any, minToReceive: number) => {
        return window.WavesKeeper.signAndPublishTransaction({
            type: 16,
            data: {
                "fee": { "tokens": "0.005", "assetId": "WAVES" },
                "dApp": pool.contractAddress,
                "call": {
                    function: 'swap',
                    args: [
                        { "type": "string", "value": txData.tokenOut },
                        { "type": "integer", "value": minToReceive }
                    ],
                }, "payment": [{
                    "assetId": txData.pmt.assetId,
                    "tokens": txData.pmt.amount / pool.tokenDecimals[pool.tokenIds.indexOf(txData.pmt.assetId)]}]
            }
        })
            .then((tx: any) => handleExchangePromise(tx))
            .catch((error: any) => handleExchangeError(error) );
    }

    const [modal, setModal] = useState(false);

    const toggle = () => setModal(!modal);

    const toReceive = Math.floor(props.toReceive * pool.tokenDecimals[props.tokenOut]);

    return (
        <div>
            <button onClick={toggle} className="button primary large wide">{buttonLabel}</button>
            <div className="details__table">
                <div className="details__table--row">
                    <div>Route</div>
                    <div className="details__table--row-desc"> --
                        {/*TODO make this to open modal window with Routing*/}
                        <img src={openFull} alt="icon"/>
                    </div>
                </div>
                <div className="details__table--row">
                    <div>Minimum to receive</div>
                    {/*TODO put amount of cashback here*/}
                    <div className="details__table--row-desc">0 PUZZLE
                        <button className="button__icon-image" id="PopoverFocus" onClick={(e) => e.currentTarget.focus()}><img src={newInfo} alt="icon" /></button>
                        <UncontrolledPopover className="custom-popover" trigger="focus" placement="top" target="PopoverFocus" arrowProps="left">
                            <PopoverBody className="details__popover">
                                <div className="details__popover--pair">
                                    <div className="details__popover--pair-name">Protocol fee:</div>
                                    <div className="details__popover--pair-amount">4 USDN</div>
                                </div>
                                <div className="details__popover--pair">
                                    <div className="details__popover--pair-name">LP fee:</div>
                                    <div className="details__popover--pair-amount">1.2%</div>
                                </div>
                            {/*TODO add related info for price impact*/}
                                <div className="details__popover--pair">
                                    <div className="details__popover--pair-name">Price impact:</div>
                                    <div className="details__popover--pair-amount">0.02%</div>
                                </div>

                            </PopoverBody>
                        </UncontrolledPopover>
                    </div>


                </div>
                <div className="details__table--row">
                    <div>Cashback</div>
                    <div className="details__table--row-cashback">
                        {/*TODO put amount of cashback here*/}
                        <img src={puzzleIcon} alt="icon"/>0.7433</div>
                </div>
            </div>

            <Modal isOpen={modal} toggle={toggle} className={className+" mt-5"}>
                <ModalHeader toggle={toggle}>Connect wallet</ModalHeader>
                <ModalBody className="text-center">
                    <button className="button secondary large wide button__icon"
                        onClick={() => exchangeWithSigner(txData, signerEmail.signer, toReceive).then(toggle)}>Waves Exchange Email
                        <img className="button__icon-image" src={mail} alt=""/>
                    </button>
                    <button className="button secondary large wide button__icon"
                        onClick={() => exchangeWithSigner(txData, signerWeb.signer, toReceive).then(toggle)}>Waves Exchange Seed
                        <img className="button__icon-image" src={seed} alt=""/>
                    </button>
                    <button className="button secondary large wide button__icon"
                        onClick={() => exchangeWithKeeper(txData, toReceive).then(toggle)}>Waves Keeper
                        <img className="button__icon-image" src={wx} alt=""/>
                    </button>
                </ModalBody>
            </Modal>
        </div>
);
}


export default ModalWindow;