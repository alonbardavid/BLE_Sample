import React from 'react';
import {View,StyleSheet,Button,Text} from 'react-native';
import {BleService} from './ble';
import {Storage} from "./storage";
import {observer} from 'mobx-react/native';
import Avatar from './avatar';

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
    rows:[],
    averageCount:null
  }
  connect = ()=>{
    this.ble.scan()
  }
  shutdown = ()=>{
    this.ble.shutdown()
  }
  train = ()=>{
    this.ble.startTraining();
  }
  test = ()=>{
    this.ble.startTest();
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
  refreshAverageCount= ()=>{
    const averageCount = this.ble.getAverageCount();
    this.setState({
      averageCount
    })
  }
  render(){
    const {rowCount,rows ,averageCount} = this.state;
    const {state,lastError,currentAngle,calibration} = this.ble;
    const frame = currentAngle?(currentAngle[0] % 49 + 1):0;
    return <View>
      <View style={[styles.row]} >
        <Text>state: {state} | frame: {frame} | calibration: {calibration}</Text>
      </View>
      {lastError  && <View style={[styles.row]} >
        <Text>error: {lastError}</Text>
      </View>}
      <View style={[styles.row]} >
        <Button title="connect" onPress={this.connect} />
        <Button title="train"   onPress={this.train} />
        <Button title="test"   onPress={this.test} />
        <Button title="shutdown"   onPress={this.shutdown} />
      </View>
      <View style={[styles.row]} >
        <Text>rowCount: {rowCount}</Text>
        <Text>average timings: {averageCount}</Text>
      </View>
      <View style={[styles.row]} >
        <Button title="update count" onPress={this.updateCount} />
        <Button title="update timing" onPress={this.refreshAverageCount} />
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
      {<View style={styles.imageContainer} >
        <Avatar style={styles.image}  index={frame}/>
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
  },
  imageContainer:{
    marginTop:150,
    justifyContent:"center",
    alignItems:"center"
  },
  image:{
    position:"absolute",
    width:250,
    height:250
  }
});