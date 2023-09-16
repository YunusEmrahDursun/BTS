export default {
    databaseServer: {
      host: "localhost",
      user: "bts",
      password: "JKLo987ui",
      multipleStatements: true,
      dateStrings: 'date',
      charset : 'utf8mb4'
    },
    databaseName:"bts",
    sessionServer:{
      host: "localhost",
      user: "bts",
      port: 3306,
      password: "JKLo987ui",
      database: 'bts',
      checkExpirationInterval: 5*60*1000,
      expiration: 60*60*24*2
    }
  };
  