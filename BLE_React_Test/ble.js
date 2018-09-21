import BleManager from 'react-native-ble-manager';
import {NativeEventEmitter, NativeModules} from "react-native";
import {observable} from 'mobx';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const TRAIN_SERVICE = "aac0";
const SMOOTH_ANGLE_CHARECTERISTIC = "aaca";
const CALIBRATION_SERVICE = "aab0";
const START_CALIBRATION_CHARECTERISTIC = "aab1";
const START_CALIBRATION_COMMAND = [1];
const CALIBRATION_ACK_CHARECTERISTIC = "aab2";

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
  calibration = "no"

  constructor(storage){
    this.deviceListeners.push(bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',
      this.handleDiscoverPeripheral ));
    this.deviceListeners.push(bleManagerEmitter.addListener('BleManagerDisconnectPeripheral',
      this.handleDisconnectedPeripheral ));
    this.deviceListeners.push(bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic',
      this.handleUpdateValueForCharacteristic ));
    this.deviceListeners.push(bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan ));
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
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
    if (isCharacterstic(data.characteristic,SMOOTH_ANGLE_CHARECTERISTIC)) {
      this.storage.insert(data);
      this.currentAngle = data.value;
    } else if (isCharacterstic(data.characteristic,CALIBRATION_ACK_CHARECTERISTIC)) {

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
    this.validateServices().then(()=> {
      BleManager.startNotification(this.connectedDevice.id, CALIBRATION_SERVICE, CALIBRATION_ACK_CHARECTERISTIC).then(()=>{
        console.log('Started calib ack notification on ' + this.connectedDevice.id);
      });
      BleManager.write(this.connectedDevice.id,
        CALIBRATION_SERVICE, START_CALIBRATION_CHARECTERISTIC,START_CALIBRATION_COMMAND).then(()=>{
        console.log('Started calibration on ' + this.connectedDevice.id);
        this.calibration = "starting";
      }).catch(e=>console.log(e))
    });

  }
  validateServices(){
    if (!this.connectedDevice){
      throw new Error("not connected to device");
    }
    return BleManager.retrieveServices(this.connectedDevice.id).then((info)=> {
      console.log("retrieved services",info);
      if (info.services.findIndex(s => s.uuid === TRAIN_SERVICE) < 0 ||
        info.characteristics.findIndex(c => c.characteristic == SMOOTH_ANGLE_CHARECTERISTIC) < 0 ||
        info.characteristics.findIndex(c => c.characteristic == CALIBRATION_ACK_CHARECTERISTIC) < 0) {
        console.log("failed to validate services", info);
        throw new Error("could not find service/characteristic on device");
      }
    })
  }
  startTraining(){
    console.log("training started")
    this.validateServices().then(()=>{
      BleManager.startNotification(this.connectedDevice.id, TRAIN_SERVICE, SMOOTH_ANGLE_CHARECTERISTIC).then(()=>{
        console.log('Started notification on ' + this.connectedDevice.id);
      })
    })
  }
}

function isCharacterstic(value,compareTo){
  return value.indexOf(compareTo) === 0 || value.indexOf(`0000${compareTo}`) === 0;
}