import React from "react";

interface IState{
    currentTimestamp: number;
}

interface IProps{
    helloWord: string;
    clickHandler: Function;
}

export class ExampleClass extends React.Component<IProps, IState>{

    constructor(props: any) {
        super(props);
        this.state = {
            currentTimestamp: 10
        }
    }

    componentDidMount() {
        setInterval(() => {
            this.setState({
                currentTimestamp: Date.now()
            })
        }, 1000);
    }

    returnRandom(){
        return 5;
    }

    render(){
        return <div onClick={() => this.props.clickHandler()}>
            {this.props.helloWord}
            {this.returnRandom()}
            {this.state.currentTimestamp}
        </div>
    }
}