const inquirer = require("inquirer");
const mysql = require("mysql2");
require("console.table");

const dbConnection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Intutr4599?',
    database: 'company_db'
});


function initialList() {
    inquirer
    .prompt({
        type: 'list',
        pageSize: 20,
        name: 'task',
        message: 'Please choose an action:',
        choices: [
            "View all Employees",
            "Add Employee",
            "Update an Employee's Role",
            "View all Roles",
            "Add Role",
            "View all Departments",
            "Add a Department",
            "I'm Done"
        ]

    }).then(function ({ task }) {
        switch(task) {
            case "View all Employees":
                showAllEmployees();
                break;
            case "Add a new Employee":
                addNewEmployee();
                break;
            case "Update an Employee's Role":
                updateEmployeeRole();
                break;
            case "View all Roles":
                showAllRoles();
                break;
            case "Add Role":
                addNewRole();
                break;
            case "View all Departments":
              showAllDepartments();
              break;
            case "Add a Department":
              addNewDepartment();
              break;
            case "I'm Done'":
                console.log("\nApplication exited.  Good Bye!")
                dbConnection.end();
                break;
        }
    })
}
function showAllEmployees() {
    dbConnection.query(`SELECT emp.id AS "Employee Id",
    emp.first_name AS "First Name",
    emp.last_name AS "Last Name",
    role.title AS "Job Title",
    dept.name AS "Department",
    role.salary AS "Salary",
    emp.manager_id AS "Manager"
    FROM employees emp
    LEFT JOIN roles role
        ON emp.role_id=role.id
    LEFT JOIN departments dept
        ON role.department_id=dept.id
    LEFT JOIN employees man
        ON man.id=emp.manager_id
    GROUP BY emp.id;
    `, function (err, results){
        if(err){
            console.log(err);
        } else{
            console.table('\n Here are all the managers in the company:', results); 
        }

    })
}

function showAllDepartments() {
    console.log('Here are all the Departments I have:\n');

    let query = `
        SELECT name as "Department",
        id as "Department ID"
        FROM departments;`
        
        connection.query(query, function (err, res) {
            if (err) throw err;
        
            console.table(res);        
            initialList();
    });
        
}

// ShowAllRoles function
function showAllRoles() {
    dbConnection.query(`SELECT  role.title AS "Title",
            role.id AS "Role ID",
            dept.name AS "Department Name",
            role.salary AS "Salary"
        FROM roles role
        JOIN departments dept
        ON role.department_id=dept.id
        ;`, function (err, results){
            if(err){
                console.err(err)
            }else{
                console.table('\n Here are all the roles in the company:', results); 
            }

        })
            initialList();   
}

initialList();