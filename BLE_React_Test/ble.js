import BleManager from 'react-native-ble-manager';
import {NativeEventEmitter, NativeModules, PermissionsAndroid, Platform} from "react-native";
import {observable,computed} from 'mobx';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const TRAIN_SERVICE = "aac0";
const SMOOTH_ANGLE_CHARECTERISTIC = "aaca";
const CALIBRATION_SERVICE = "aab0";
const START_CALIBRATION_CHARECTERISTIC = "aab1";
const START_CALIBRATION_COMMAND = [1];
const CALIBRATION_ACK_CHARECTERISTIC = "aab2";
const POWER_SERVICE = "aaa0";
const HAL_CONTROL_CHARECTERISTIC = "aaa4";
const SHUTDOWN_COMMANS = [3];
const TEST_SENSOR_CHARECTERISTIC ="aad1";
const TEST_SERVICE = "aad0";

export class BleService {

  deviceListeners = [];
  @observable
  peripherals = [];
  @observable
  state = "unconnected";
  @observable
  lastError = null;
  @observable
  connectedDevice = null;
  @observable
  currentAngle = null;
  @observable
  calibration = "no";

  timings = {};

  constructor(storage){
    this.deviceListeners.push(bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral ));
    this.deviceListeners.push(bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',
      this.handleDisconnectedPeripheral ));
    this.deviceListeners.push(bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',
      this.handleUpdateValueForCharacteristic ));
    this.deviceListeners.push(bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan ));
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }
    BleManager.start().then(()=>{
      BleManager.getConnectedPeripherals().then((res)=>{
        console.log("got connected peripherals",res);
        if (res && res.length >0){
          this.setDevice(res[0]);
        }
      })
      BleManager.scan([], 3, true);
    });
    this.storage = storage;
  }

  addTiming(){
    const now = Math.floor(new Date().getTime() / 1000);
    this.timings[now] = (this.timings[now] || 0) + 1;
  }
  getAverageCount() {
    const keys = Object.keys(this.timings);
    return keys.map(i=>this.timings[i]).reduce((sum,i)=>sum+i,0) / keys.length;
  }
  setDevice(device){
    this.connectedDevice = device;
    this.state = "connected";
  }
  handleDiscoverPeripheral = (peripheral)=>{
    console.log("discovered device",peripheral);
    this.peripherals.push(peripheral);
  }
  handleDisconnectedPeripheral = ()=>{

  }
  handleUpdateValueForCharacteristic = (data)=>{
    //console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
    if (isCharacterstic(data.characteristic,SMOOTH_ANGLE_CHARECTERISTIC)) {
      this.storage.insert(data);
      //this.currentAngle = data.value;
      //this.addTiming();
    } else if (isCharacterstic(data.characteristic,CALIBRATION_ACK_CHARECTERISTIC)) {

    } else if (isCharacterstic(data.characteristic,TEST_SENSOR_CHARECTERISTIC)){
      this.addTiming();
    }
  }
  handleStopScan = ()=>{
    console.log("stop scan received");
    if (this.state !== "scanning"){
      return;
    }
    let devices = this.peripherals.filter(p=>p.name && p.name.toLowerCase().indexOf("upright") >=0);
    if (devices.length === 0){
      console.log("failed to find device",this.peripherals);
      this.state = "failed";
      this.lastError = "could not find device";
    } else {
      const device = devices[0];
      console.log("trying to connect to device",device);
      this.state = "connecting";
      BleManager.connect(device.id).then(()=>{
        console.log("connected to device");
        this.setDevice(device);
      }).catch(e=>{
        console.log("failed to connect to device",e);
        this.state = "failed";
        this.lastError = "failed to connect to device";
      });
    }
  }
  scan(){
    if (this.state === "scanning") {
      return;
    }
    console.log('scanning started');
    this.state = "scanning";
    this.lastError = null;
    BleManager.scan([], 3, true).catch(e=>{
      this.state = "failed";
      this.lastError = "failed to start scan ${e.message}"
    })
  }
  calibrate() {
    console.log("calibrate started");
    this.validateServices().then((info)=> {
      BleManager.startNotification(this.connectedDevice.id, CALIBRATION_SERVICE, CALIBRATION_ACK_CHARECTERISTIC).then(()=>{
        console.log('Started calib ack notification on ' + this.connectedDevice.id);
      });
      const cha = this.getCharacteristic(info,START_CALIBRATION_COMMAND);
      BleManager.write(this.connectedDevice.id,
        cha.service, cha.characteristic,START_CALIBRATION_COMMAND).then(()=>{
        console.log('Started calibration on ' + this.connectedDevice.id);
        this.calibration = "starting";
      }).catch(e=>console.log(e))
    });

  }
  shutdown() {
    this.validateServices().then((info)=>{
        const cha = this.getCharacteristic(info,HAL_CONTROL_CHARECTERISTIC);
        BleManager.write(this.connectedDevice.id,cha.service, cha.characteristic,SHUTDOWN_COMMANS).then(x=>console.log("shutdown",x))
    })
  }
  validateServices(){
    if (!this.connectedDevice){
      throw new Error("not connected to device");
    }
    return BleManager.retrieveServices(this.connectedDevice.id).then((info)=> {
      console.log("retrieved services",info);
      if (!this.getCharacteristic(info,SMOOTH_ANGLE_CHARECTERISTIC) ||
          !this.getCharacteristic(info,CALIBRATION_ACK_CHARECTERISTIC)) {
        console.log("failed to validate services", info);
        throw new Error("could not find service/characteristic on device");
      }
      return info;
    })
  }
  getCharacteristic(info,characterId){
    const index =info.characteristics.findIndex(c=>c.characteristic.toLowerCase() === characterId);
    return index >=0? info.characteristics[index]: null;
  }
  startTraining() {
      this.timings = {};
      console.log("training started")
      this.validateServices().then((info) => {
          const cha = this.getCharacteristic(info, SMOOTH_ANGLE_CHARECTERISTIC);
          BleManager.startNotification(this.connectedDevice.id, cha.service, cha.characteristic).then(() => {
              console.log('Started trainingnotification on ' + this.connectedDevice.id);
          })
      })
  }
  startTest(){
    this.timings = {};
    console.log("test started")
    this.validateServices().then((info)=>{
        const cha = this.getCharacteristic(info, TEST_SENSOR_CHARECTERISTIC);
        BleManager.startNotification(this.connectedDevice.id, cha.service, cha.characteristic).then(()=>{
        console.log('Started test notification on ' + this.connectedDevice.id);
      })
    })
  }
}

function isCharacterstic(value,compareTo){
  return value.toLowerCase().indexOf(compareTo) === 0 || value.toLowerCase().indexOf(`0000${compareTo}`) === 0;
}