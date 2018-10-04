import SQLite  from 'react-native-sqlite-storage';


export class Storage {

  constructor(){
    this.db =SQLite.openDatabase({name : "sensorValues", location: 'default'}, this.onDatabaseConnected,this.onDatabaseError);
  }

  onDatabaseConnected = ()=>{
      this.db.transaction(function(tx) {
          console.log('creating data table');
          tx.executeSql('CREATE TABLE IF NOT EXISTS sensor_values (date,peripheral,characteristic,value)');
      }, function(error) {
          console.log('Transaction ERROR: ' + error.message);
      }, function(a) {
          console.log('created database OK',a);
      });
  }
  onDatabaseError = (e)=>{
    console.log("failed to open database",e);
  }

  cache = [];
  insert(data){
    if (this.cache.length < 19){
      this.cache.push(data);
    } else {
        this.cache.push(data);
        const params = [];
        for (let i=0 ;i < data.length; i++) {
            let d = this.cache[i];
            params.push(new Date().toISOString());
            params.push(d.peripheral);
            params.push(d.characteristic);
            params.push(d.value.toString());
        }
        this.cache = [];
        this.db.transaction(function (tx) {
            //console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
            tx.executeSql(`INSERT INTO sensor_values VALUES (?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?)`,
                params);
        }, function (error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function () {
            //console.log('Populated database OK');

        });
    }
  }

  getData(page=0,perPage=5){
    return new Promise((resolve,reject)=>{
      this.db.transaction((tx)=>{
        tx.executeSql("SELECT ROWID as id,* FROM sensor_values order by date DESC LIMIT ?1 OFFSET ?2", [perPage,page*perPage],
          (tx,rs)=>{
          const items = [];
          let len = rs.rows.length;
          for (let i = 0; i < len; i++) {
            items.push(rs.rows.item(i));
          }
          resolve(items);
        })
      },reject);
    })
  }
  getCount(){
    return new Promise((resolve,reject)=> {
      this.db.transaction((tx) => {
        tx.executeSql("SELECT count(*) as ItemCount FROM sensor_values",[],(tx,rs) => {
          console.log(rs.rows);
          resolve(rs.rows.item(0).ItemCount);
        },reject)
      });
    })
  }
}