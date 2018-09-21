import SQLite  from 'react-native-sqlite-storage';


export class Storage {

  constructor(){
    this.db =SQLite.openDatabase({name : "sensorValues", location: 'default'}, this.onDatabaseConnected,this.onDatabaseError);
  }

  onDatabaseConnected = ()=>{

  }
  onDatabaseError = ()=>{

  }

  insert(data){
    this.db.transaction(function(tx) {
      console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
      tx.executeSql('CREATE TABLE IF NOT EXISTS sensor_values (date,peripheral,characteristic,value)');
      tx.executeSql('INSERT INTO sensor_values VALUES (?1,?2,?3,?4)',
        [new Date().toISOString(),data.peripheral,data.characteristic,data.value.toString()]);
    }, function(error) {
      console.log('Transaction ERROR: ' + error.message);
    }, function() {
      console.log('Populated database OK');
    });
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