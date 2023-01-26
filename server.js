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

dbConnection.connect(function (err) {
    if (err){
        console.log(err)
    }else{
        initialList();
    }
  
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
            case "Add Employee":
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
                console.log("\n Good Bye!")
                dbConnection.end();
                break;
        }
    })
}
function showAllEmployees() {

    dbConnection.query(`SELECT employee.id AS "Employee ID",
    employee.first_name AS "First Name",
    employee.last_name AS "Last Name",
    role.title AS "Job Title",
    dept.name AS "Department",
    role.salary AS "Salary",
    CONCAT(man.first_name," ", man.last_name) AS "Manager"
    FROM employees AS employee
    LEFT JOIN roles AS role
        ON employee.role_id=role.id
    LEFT JOIN departments AS dept
        ON role.department_id=dept.id
    LEFT JOIN employees AS man
        ON man.id=employee.manager_id
    GROUP BY employee.id;
    `, function (err, results){
        if(err){
            console.log(err);
            initialList();
        } else{
            console.table('\n Here are all the employees in the company:', results); 
            console.table("What would you like to do now")
            initialList();
        }

    })
}
// todo need to add role generator
function addNewEmployee(){

// asks user if what the name of the employee is
    inquirer.prompt([
        {
            type: 'input',
            name: 'employeeFirstName',
            message: "what is the first name of the employee you are adding?",
        },
        {
            type: 'input',
            name: 'employeeLastName',
            message: "what is the last name of the employee you are adding?",
        }
    ]).then(answers => {
        let newEmployeeInfo = [answers.employeeFirstName, answers.employeeLastName];
        // grabs all the roles in the company for the options to be displayed
        let sqlCommand = `SELECT * FROM roles`;
        dbConnection.query(sqlCommand, (err, results) => {
            if (err){
                console.log(err); 
            } else{
                let roles = results.map(({ id, title }) => ({ name: title, value: id }));
                inquirer.prompt([
                        {
                        type: "list",
                        pageSize: 12,
                        name: "role",
                        message:"Select employees Role:",
                        choices: roles
                        }
                    ]).then(roleChoice => {
                        let role = roleChoice.role
                        newEmployeeInfo.push(role);

                        let sqlCommand = `SELECT * FROM employees WHERE manager_id is NULL`
                        dbConnection.query(sqlCommand, (err, results) => {
                            if(err){
                                console.log(err)
                            } else {
                                let managers = results.map(({ id, first_name, last_name}) => ({ name: first_name + " " + last_name, value: id}));
                                managers.push({name: "This is a Manager", value: (null)})
                            inquirer.prompt([{
                                type: "list",
                                pageSize: 12,
                                name: "manager",
                                message: "What is this employees manager",
                                choices: managers
                            }]).then(function (answer) {
                                let manager = answer.manager;
                                newEmployeeInfo.push(manager);
                                let sqlCommand = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                                VALUES (?, ?, ?, ?)`;
                                dbConnection.query(sqlCommand, newEmployeeInfo, (error) => {
                                    if (error){
                                        console.log(error)
                                    } else{
                                        console.log("\n Added Employee \n");
                                        initialList();
                                    }
                                })
                            })
                            }
                        })
                    })   
                }
            });  
        })
}

function updateEmployeeRole(){
    let sqlCommand = `SELECT * FROM employees`

    
    dbConnection.query(sqlCommand, function (err, results){
        if (err){
            console.log(err);
        } else{
            let allEmployees = [];
            results.forEach(results => {
            allEmployees.push( results.id + " " + results.first_name + " " + results.last_name);
            });
            inquirer.prompt([
                {
                    name: "employeeName",
                    type: "list",
                    message: "Choose an employee's emotions to play with!",
                    choices: allEmployees
                }
            ]).then(function (usersAnswers) {
                const employeeName = usersAnswers.employeeName;

                let sqlCommand = `SELECT * FROM roles`;

                dbConnection.query(sqlCommand, function (error, results){
                    if(error){
                        console.log(error)
                    } else{
                        employeeNewRole = [];
                        results.forEach(results => {
                            employeeNewRole.push(results.title)
                        })
                        inquirer.prompt([
                            {
                                name: "role",
                                type: "list",
                                message: "Choose new role for employee",
                                choices: employeeNewRole
                            }
                        ]).then(function (newRoleResponse){
                            let newRole = newRoleResponse.role
                            
                            let sqlCommand = `SELECT * FROM roles WHERE title = ?`
                            dbConnection.query(sqlCommand, newRole, (error, results) => {
                                if (error){
                                    console.log(error);
                                }else{
                                    let newRoleId = results[0].id

                                    let sqlCommand = `
                                    UPDATE employees
                                    SET role_id = ?
                                    WHERE CONCAT(id, " ", first_name, + " ",last_name) = ?`;

                                    let updatedEmployee = [newRoleId, employeeName]
                                    dbConnection.query(sqlCommand, updatedEmployee, (error, results) => {
                                        if (error){
                                            console.log(error);
                                        }else{
                                            console.log(`\n You have updated an employee's role \n`);
                                            initialList();
                                        }

                                    })
                                }
                            })
                        })
                    }
                })
            })
        }})
}

// ShowAllRoles function
function showAllRoles() {
    let sqlCommand = `SELECT  roles.title AS "Title",
    roles.id AS "Role ID",
    dept.name AS "Department Name",
    roles.salary AS "Salary"
    FROM roles
    JOIN departments dept
    ON roles.department_id=dept.id`;
    dbConnection.query(sqlCommand, function (err, results){
            if(err){
                console.log(err)
            }else{
                console.table('\n Here are all the roles in the company:', results); 
                initialList();  
            }
        })
}
// Creates New role
function addNewRole(){
    inquirer.prompt([
        {
            type: "input",
            name: "newRole",
            message: " What is the name of the new role"
        },
        {
            type: "input",
            name: "roleSalary",
            message: "How much does this Role make in Salary"
        }
    ]).then(function (results){
        let newRole = [results.newRole, results.roleSalary]

        let sqlCommand = `SELECT * FROM departments`;

        dbConnection.query(sqlCommand, function (error, results){
            if(error){
                console.log(error)
            } else{
                let departments = results.map(({ id, name }) => ({name: name, value: id}));
                inquirer.prompt([
                    {
                        type: "list",
                        name: "departments",
                        message: "What department is this role a part of?",
                        choices: departments
                    }
                ]).then(function (results){
                    let dept = results.departments
                    newRole.push(dept)

                    let sqlCommand = `
                    INSERT INTO roles (title, salary, department_id)
                    VALUES (?, ?, ?)`
                    dbConnection.query(sqlCommand, newRole, (error) => {
                        if(error){
                            console.log(error);
                        } else{
                            console.log(`\n Added New Role Named ${newRole[0]} \n`);
                        }
                    })
                })
            }
        })
    })
}

function showAllDepartments() {

    let sqlCommand = `
        SELECT name AS "Department",
        id AS "Department ID"
        FROM departments;`
        
        dbConnection.query(sqlCommand, function (error, results) {
            if (error){
                console.log(error)
            }else{
                console.log("\n Here is a list of all the departments. \n")
                console.table(results);        
                initialList();
            }
    });
        
}

function addNewDepartment(){
    inquirer.prompt([
        {
            name: "newDepartment",
            type: "input",
            message: "What is the name of this new Department you keep talking about?"
        }
    ]).then(function (newDepartmentName){
        let newDepartment = newDepartmentName.newDepartment;

        let sqlCommand = `INSERT INTO departments (name)
        VALUES (?)`
        dbConnection.query(sqlCommand, newDepartment, (error) => {
            if (error){
                console.log(error)
            } else{
                console.log(`\n you have added the new Department called ${newDepartment}, \n Are you happy now??? WEll Leave me alone then.\n`)
                initialList();
            }
        })
    })
}