const mysql2 = require('mysql2/promise'); 

// const dbConfig = {host:'localhost', user: 'root', database: 'blog'};

const dbConfig = {host:'localhost', user: 'root', database: 'vector'};


async function create({table,values}){


    const connection = await mysql2.createConnection(dbConfig);
      
    const insertQuery = buildInsertQuery(table, values);

    const [result] = await connection.execute(insertQuery, []);

    connection.close();

    return result;

}

async function read({tableName,columnNames}){


    const connection = await mysql2.createConnection(dbConfig);
      
    const selectQuery = buildSelectQuery(tableName, columnNames);

    const [result] = await connection.execute(selectQuery, []);

    connection.close();

    return result;
}

async function readWhere({tableName, columnNames, condition}){

    const connection = await mysql2.createConnection(dbConfig);
      
    const selectQuery = buildSelectWhereQuery(tableName, columnNames, condition);

    const [result] = await connection.execute(selectQuery, []);

    connection.close();

    return result;

}

async function readAll({tableName}){


    const connection = await mysql2.createConnection(dbConfig);
      
    const selectQuery = buildSelectAllQuery(tableName);

    const [result] = await connection.execute(selectQuery, []);

    connection.close();

    return result;

}


function buildInsertQuery(tableName, data) {

    var date =  new Date();
    var timeStamp = date.getTime();

    const keys = Object.keys(data);
    const values = Object.values(data);

    const columnNames = keys.join(', ');
  
    const escapedValues = values.map((value) => {
        if(typeof value === 'string')
        {
            return `'${value}'`;
        }
        else{
            return value
        }
    });
    const valuePlaceholders = escapedValues.join(', ');

    const query = `INSERT INTO ${tableName} (id, ${columnNames}, created_at, updated_at) VALUES (null, ${valuePlaceholders}, ${timeStamp}, ${timeStamp})`;
  
    return query;
}

function buildSelectQuery(tableName, columnNames) {

    const columns = columnNames.join(', ');
    const query = `SELECT ${columns} FROM ${tableName}`;
    return query;
}

function buildSelectWhereQuery(tableName,columnNames, condition){

    const columns = columnNames.join(', ');
    const query = `SELECT ${columns} FROM ${tableName} WHERE ${condition}`;
    return query;
}

function buildSelectAllQuery(tableName){

    const query = `SELECT * from ${tableName}`;
    return query;
}


const db = {
    create, read, readWhere, readAll
}

module.exports = db;

