import React from 'react';
import {Image} from 'react-native';

export default class AndroidIos extends React.Component {


  constructor(props){
    super(props);
    this.current = props.index;
    this.interval = null;
    this.ref = null;
  }

  componentWillReceiveProps(newProps){
    if (newProps.index !== this.current){
      this.startAnimation();
    }
  }
  startAnimation(){
    this.interval = setInterval(this.onInterval,60);
  }
  onInterval = ()=>{
    if (this.current === this.props.index && this.interval){
      clearInterval(this.interval);
      this.interval = null;
    } else {
      this.current += this.props.index > this.current?+1:-1;
      this.ref.setNativeProps({
          source: [{url:`green_avi${this.current}`}]
      })
    }
  }

  render(){
    const {style} = this.props;
    return <Image style={style} source={{url:`green_avi${this.current}`}} ref={ref=>this.ref = ref}/>
  }
}