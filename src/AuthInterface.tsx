/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, UncontrolledPopover, PopoverHeader, PopoverBody } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-notifications-component/dist/theme.css'
import {signerEmail, signerWeb} from "./SignerHandler";
import ReactNotification from 'react-notifications-component'
import { store } from 'react-notifications-component';

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
    let buttonLabel = "Exchange";
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
            <button onClick={(e) => e.currentTarget.focus()} className="infoIcon button secondary large wide" id="PopoverFocus" type="button">
                Details
            </button>
            <UncontrolledPopover className="custom-popover infoPopup" trigger="focus" placement="bottom" target="PopoverFocus">
                <PopoverBody className="">
                    Protocol fee: 0.8% <br/>
                    LP fee: 1.2% <br/>
                    Slippage tolerance: 3% <br/>
                    Minimum to receive: {props.toReceive} {pool.tokenNames[props.tokenOut]} <br/>
                </PopoverBody>
            </UncontrolledPopover>

            <Modal isOpen={modal} toggle={toggle} className={className+" mt-5"}>
                <ModalHeader toggle={toggle}>Connect your wallet</ModalHeader>
                <ModalBody className="text-center">
    <button className="button primary large wide"
                 onClick={() => exchangeWithSigner(txData, signerEmail.signer, toReceive).then(toggle)}>Waves Exchange Email</button>
    <button className="button primary large wide"
                 onClick={() => exchangeWithSigner(txData, signerWeb.signer, toReceive).then(toggle)}>Waves Exchange Seed</button>
    <button className="button primary large wide"
                 onClick={() => exchangeWithKeeper(txData, toReceive).then(toggle)}>Waves Keeper</button>
                </ModalBody>
            </Modal>
        </div>
);
}


export default ModalWindow;