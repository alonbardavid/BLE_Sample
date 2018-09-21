import React from 'react';
import {View,StyleSheet,Button,Text} from 'react-native';
import {BleService} from './ble';
import {Storage} from "./storage";
import {observer} from 'mobx-react/native';

@observer
export class App extends React.Component {

  constructor(props) {
    super(props);
    this.storage = new Storage();
    this.ble = new BleService(this.storage);
  }

  state = {
    rowCount:null,
    rowIndex:0,
    rows:[]
  }
  connect = ()=>{
    this.ble.scan()
  }
  calibrate = ()=>{
    this.ble.calibrate()
  }
  train = ()=>{
    this.ble.startTraining();
  }
  updateCount = ()=>{
    this.storage.getCount().then(rowCount=>this.setState({rowCount}));
  }
  loadRows = ()=>{
    this.storage.getData(this.state.rowIndex).then(rows=>this.setState({
      rows,
      rowIndex:this.state.rowIndex + 5
    }));
  }
  render(){
    const {rowCount,rows} = this.state;
    const {state,lastError,currentAngle,calibration} = this.ble;
    return <View>
      <View style={[styles.row]} >
        <Text>state: {state} | angle: {JSON.stringify(currentAngle || "")} | calibration: {calibration}</Text>
      </View>
      {lastError  && <View style={[styles.row]} >
        <Text>error: {lastError}</Text>
      </View>}
      <View style={[styles.row]} >
        <Button title="connect" onPress={this.connect} />
        <Button title="train"   onPress={this.train} />
        <Button title="calibrate"   onPress={this.calibrate} />
      </View>
      <View style={[styles.row]} >
        <Text>rowCount: {rowCount}</Text>
      </View>
      <View style={[styles.row]} >
        <Button title="update count" onPress={this.updateCount} />
        <Button title="load rows" onPress={this.loadRows} />
      </View>
      {rows.length > 0 && <View>
        {rows.map(r=><View style={[styles.row,{justifyContent:"flex-start"}]} key={r.id}>
          <View style={styles.cell}><Text>{r.date}</Text></View>
          <View style={styles.cell}><Text>{r.value}</Text></View>
        </View>)}
        <View style={styles.row}>
          <Button title="next" onPress={this.loadRows}/>
        </View>
      </View>}
    </View>
  }
}

function getFrameFromAngle(angle){
}

const styles = StyleSheet.create({
  row:{
    flexDirection: "row",
    justifyContent:"space-between",
    margin:10
  },
  cell:{
    padding:5,
    borderColor:"black",
    borderWidth:1
  }
});