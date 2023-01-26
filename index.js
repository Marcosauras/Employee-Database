const inquirer = require("inquirer");
const mysql = require("mysql2");
require("console.table");

// Configure the MySQL connection properties
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Intutr4599?',
    database: 'company_db'
});

connection.connect(function (err) {
    if (err) throw err;
    initialList();
});

function initialList() {
    inquirer
    .prompt({
        type: 'list',
        pageSize: 20,
        name: 'task',
        message: 'Please choose an action:',
        choices: [
            "View all Departments",
            "View all Roles",
            "View all Employees",
            "Add a new Role",
            "Add a new Department",
            "Add a new Employee",
            "Update an Employee's Role",
            "Total Budget By Department",
            "I don't need anything else."
        ]
    }).then(function ({ task }) {
        switch(task) {
            case "View all Departments":
              showAllDepartments();
              break;
            
            case "View all Roles":
              showAllRoles();
              break;

            case "View all Employees":
              showAllEmployees();
              break;

            case "Add a new Role":
              addNewRole();
              break;
            
            case "Add a new Department":
              addNewDepartment();
              break;

            case "Add a new Employee":
              addNewEmployee();
              break;

            case "Update an Employee's Role":
              updateEmployeeRole();
              break;
            
            case "Total Budget By Department":
              deptBudgets();
              break;
           
            case "I don't need anything else.":
                console.log("\nApplication exited.  Have a great day!")
                connection.end();
                break;
        }
    })
}

// ShowAllDepartments function
function showAllDepartments() {
    console.log('Here are all the Departments I have:\n');

    let query = `
        SELECT name as "Department",
        id as "Department ID"
        FROM departments
        ;`
        
        connection.query(query, function (err, res) {
            if (err) throw err;
        
            console.table(res);        
            initialList();
    });
        
}

// ShowAllRoles function
function showAllRoles() {
    console.log('Here are all the Roles I have:\n');

    let query = `
        SELECT role.title AS "Job Title",
            role.id AS "Job ID",
            dept.name AS "Department",
            role.salary AS "Salary"
        FROM roles role
        JOIN departments dept
        ON role.department_id=dept.id
        ;`
        
        connection.query(query, function (err, res) {
            if (err) throw err;
        
            console.table(res);        
            initialList();
    });       
}

// ShowAllEmployees function with a CASE statement that ensures "Self" is displayed for any managers (with NULL empty manager_id)
function showAllEmployees() {
    console.log('Here are all the employees I have:\n');

    let query =`
        SELECT emp.id AS "Employee ID",
            emp.first_name AS "First Name",
            emp.last_name AS "Last Name",
            role.title AS "Job Title",
            dept.name AS "Department",
            role.salary AS "Salary",
            CASE WHEN emp.manager_id IS NULL THEN "Self"
             ELSE CONCAT(man.first_name," ", man.last_name)
             END AS "Manager"
        FROM employees emp
        LEFT JOIN roles role
            ON emp.role_id=role.id
        LEFT JOIN departments dept
            ON role.department_id=dept.id
        LEFT JOIN employees man
            ON man.id=emp.manager_id
        GROUP BY emp.id,
            CASE WHEN emp.manager_id IS NULL THEN "Self"
            WHEN emp.manager_id = emp.id THEN "Self"
            ELSE CONCAT(man.first_name," ",man.last_name)
            END
        ;`
        
        connection.query(query, function (err, res) {
            if (err) throw err;
        
            console.table(res);        
            initialList();
    });
}

const addNewDepartment = () => {
    // Starts the question/answer process for creation of a new department
    inquirer.prompt([
      {
        type: 'input',
        name: 'deptName',
        message:"Department Name:",
      }
    ])
      .then(answer => {
        let crit = [answer.deptName]
            let sql = `
                INSERT INTO departments (name)
                VALUES (?)
                `;
            connection.query(sql, crit, (error) => {
            if (error) throw error;

            // Validation message, confirming department has bee added
            console.log("\n ==> Department added successfully <== \n");
  
            initialList();
                });
            });
};

const addNewRole = () => {
    // Provides a list of roles in the system, for help with choosing a role
    var query = `
        SELECT id,
          name 
        FROM departments
        `;
      
        connection.query(query, function (err, res) {
          if (err) throw err;
      
          let deptChoices = res.map(({ id, name }) => ({
            value: id, name: `${name}`
          }));
    
          console.log("\n\n\n");  
          console.table(res);
          console.log("NOTE: Please reference the above table when selecting a Department.\n")

          promptRoles(deptChoices);
        });
    }
    // Starts the question/answer process for creation of a new employee
    function promptRoles(deptChoices) {
    inquirer.prompt([
      {
        type: 'input',
        name: 'roleName',
        message:"Role Name:",
      },
      {
        type: 'input',
        name: 'roleSalary',
        message:"Role's Salary:",
      }
    ])
      .then(answer => {
        let crit = [answer.roleName, answer.roleSalary]
        let deptSQL = `
            SELECT * FROM departments
            `;
      connection.query(deptSQL, (error, data) => {
        if (error) throw error; 
        let dept = data.map(({ id, name }) => ({ name: name, value: id }));
        inquirer.prompt([
              {
                type: 'list',
                pageSize: 12,
                name: 'dept',
                message:"Select Department:",
                choices: dept
              }
            ])
            .then(deptChoice => {
                let depts = deptChoice.dept;
            crit.push(depts);

        

            let sql =   `INSERT INTO roles (title, salary, department_id)
                        VALUES (?, ?, ?)`;
            connection.query(sql, crit, (error) => {
            if (error) throw error;

            // Validation message, confirming role has bee added
            console.log("\n ==> Role added successfully <== \n");
  
            initialList();
                });
            });
        });
    });
};



// Add a new Employee
const addNewEmployee = () => {
    // Provides a list of roles in the system
    var query = `
        SELECT id,
            title,
            salary 
        FROM roles
        `;
      
        connection.query(query, function (err, res) {
          if (err) throw err;
      
          let roleChoices = res.map(({ id, title, salary }) => ({
            value: id, title: `${title}`, salary: `${salary}`
          }));
    
        console.log("\n");  

          promptInsert();
        });
    }
    // Starts the question/answer process for creation of a new employee
    function promptInsert() {
    inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message:"First Name:",
      },
      {
        type: 'input',
        name: 'lastName',
        message:"Last Name:",
      }
    ])
      .then(answer => {
        let crit = [answer.firstName, answer.lastName]
        let roleSql = `
            SELECT * FROM roles
            `;
      connection.query(roleSql, (error, res) => {
        if (error) throw error; 
        let roles = res.map(({ id, title }) => ({ name: title, value: id }));
        inquirer.prompt([
              {
                type: 'list',
                pageSize: 12,
                name: 'role',
                message:"Select Role:",
                choices: roles
              }
            ])

            .then(roleChoice => {
                let role = roleChoice.role;
            crit.push(role);
            let sql =  `
                SELECT * 
                FROM employees
                WHERE manager_id is NULL
                `;
            connection.query(sql, (error, res) => {
                if (error) throw error;
                let managers = res.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                inquirer.prompt([
                {
                    type: 'list',
                    pageSize: 12,
                    name: 'manager',
                    message:"Select Manager:",
                    choices: managers
                }
                ])
                    // Insterst the new Employee into the employees table
                    .then(managerChoice => {
                        let manager = managerChoice.manager;
                      crit.push(manager);
                      let sql =   `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`;
                      connection.query(sql, crit, (error) => {
                      if (error) throw error;
            
                // Validation message, confirming employee has bee added
                console.log("\n ==> Employee added successfully <== \n");      
                initialList();

                        });
                    });
                });
            });
        });
    });
};

// Function to update an employee's Role
function updateEmployeeRole() {
  connection.query('SELECT * FROM employees', function (err, result) {
    if (err) throw (err);
    inquirer
      .prompt([
        {
          name: "employeeName",
          type: "list",
          message: "Choose an Employee to update:",
          choices: function () {
            var employeeArray = [];
            result.forEach(result => {
              employeeArray.push(
                result.id+" "+result.first_name+" "+result.last_name
              );
            })
            return employeeArray;
          }
        }
      ])   
      .then(function (answer) {
        console.log(answer);
        const name = answer.employeeName;
      
        connection.query("SELECT * FROM roles", function (err, res) {
          inquirer
            .prompt([
              {
                name: "role",
                type: "list",
                message: "Chose their new role",
                choices: function () {
                  var roleArray = [];
                  res.forEach(res => {
                    roleArray.push(
                      res.title)
                  })
                  return roleArray;
                }
              }
            ]).then(function (roleAnswer) {
              let role = roleAnswer.role;
              console.log(role);
              connection.query('SELECT * FROM roles WHERE title = ?', [role], function (err, res) {
                if (err) throw (err);
                let roleId = res[0].id;
   
                let query = `
                  UPDATE employees
                  SET role_id = ?
                  WHERE CONCAT(id," ",first_name," ",last_name) =  ?`;
                let values = [parseInt(roleId), name]
        
                connection.query(query, values,
                  function (err, res, fields) {
                  })
                
                console.log(`\n ==> ${name}'s role has been updated to: ${role}. <== \n`);
                initialList();
              })
            })
        })
      })
  })
};

// ShowAllRoles function
function deptBudgets() {
  console.log(`Here's a list of departments, with their current budgets:\n`);

  let query = `
      SELECT dept.name as "Department",
      SUM(role.salary) as "Total Budget"
      FROM departments dept
      JOIN roles role
      ON dept.id=role.department_id
      JOIN employees emp
      ON role.id=emp.role_id
      GROUP BY dept.name      
      ;`
      
      connection.query(query, function (err, res) {
          if (err) throw err;
      
          console.table(res);        
          initialList();
  });       
}