const mysql2 = require('mysql2/promise'); 

// const dbConfig = {host:'localhost', user: 'root', database: 'blog'};

// const dbConfig = {host:'localhost', user: 'root', database: 'vector'};


const dbConfig = {host:'localhost', user: 'admin', password: 'admin', database: 'vector'};


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

async function deleteRow({tableName, condition}){
    
    const connection = await mysql2.createConnection(dbConfig);
      
    const selectQuery = buildDeleteQuery(tableName, condition);

    const [result] = await connection.execute(selectQuery, []);

    connection.close();

    return result;
}

async function paginate({tableName,columnNames,offset,limit}){

    const connection = await mysql2.createConnection(dbConfig);
      
    const selectQuery = buildPaginateQuery(tableName, columnNames, offset, limit);

    const [result] = await connection.execute(selectQuery, []);

    connection.close();

    return result;
}

async function getCount({tableName}){


    const connection = await mysql2.createConnection(dbConfig);
      
    const selectQuery = buildGetCountQuery(tableName);

    const [result] = await connection.execute(selectQuery, []);

    connection.close();

    return result[0].count;

}

async function update({tableName, columns, values, condition}){

    const connection = await mysql2.createConnection(dbConfig);
      
    const updateQuery = buildUpdateQuery(tableName, columns, values, condition);

    const [result] = await connection.execute(updateQuery, []);

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

function buildDeleteQuery(tableName, condition) {
    const deleteQuery = `DELETE FROM ${tableName} WHERE ${condition};`;
    return deleteQuery;
}

function buildPaginateQuery(tableName, columnNames, offset, limit) {

    const columns = columnNames.join(', ');

    const query = `SELECT ${columns} FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`;

    return query;
}

function buildGetCountQuery(tableName) {
    const query = `SELECT COUNT(*) AS count FROM ${tableName}`;
    return query;
}



function buildUpdateQuery(tableName, columns, values, condition) {


    if (!tableName || !Array.isArray(columns) || !Array.isArray(values)) {

      throw new Error('Invalid input parameters.');
    }
  
    if (columns.length !== values.length) {

      throw new Error('Columns and values arrays must have the same length.');
    }
  
    let query = `UPDATE ${tableName} SET `;

  
    // Building the SET part of the query
    const setClauses = [];
    for (let i = 0; i < columns.length; i++) {
        setClauses.push(`${columns[i]} = ${escapeValue(values[i])}`);
    }
    query += setClauses.join(', ');
  
    // Adding the WHERE clause if provided
    if (condition) {
      query += ` WHERE ${condition}`;
    }

 
    return query;
}


function escapeValue(value) {

    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    return value;
}




const db = {
    create, read, readWhere, readAll, paginate, getCount, deleteRow, update
}

module.exports = db;

